import * as notion from 'notion-types';
import { Client } from '@notionhq/client';
import { parsePageId } from 'notion-utils';

export class NotionAdapter {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private convertPageToLegacyFormat(page: any, blocks: any[]): notion.ExtendedRecordMap {
    const pageId = page.id.replace(/-/g, '');

    // 기본 RecordMap 구조 생성
    const recordMap: notion.ExtendedRecordMap = {
      block: {},
      collection: {},
      collection_view: {},
      notion_user: {},
      collection_query: {},
      signed_urls: {},
    };

    // 페이지 블록 변환
    const pageBlock = {
      role: 'editor' as notion.Role,
      value: {
        id: pageId,
        version: 1,
        type: 'page' as notion.BlockType,
        properties: {
          title: this.extractTitle(page),
        },
        content: blocks.map(block => block.id.replace(/-/g, '')),
        format: {
          page_icon: this.extractIcon(page) || null,
          page_cover: this.extractCover(page) || null,
          page_cover_position: 0.5,
        },
        permissions: [
          {
            role: 'editor' as notion.Role,
            type: 'user_permission',
          },
        ],
        created_time: new Date(page.created_time).getTime(),
        last_edited_time: new Date(page.last_edited_time).getTime(),
        parent_id: page.parent?.page_id || page.parent?.database_id || 'workspace',
        parent_table: 'space',
        alive: true,
        created_by_table: 'notion_user',
        created_by_id: this.extractUserId(page.created_by),
        last_edited_by_table: 'notion_user',
        last_edited_by_id: this.extractUserId(page.last_edited_by),
        space_id: 'workspace',
      } as notion.PageBlock,
    };

    recordMap.block[pageId] = pageBlock;

    // 블록들 변환
    this.convertBlocksToLegacyFormat(blocks, recordMap);

    // undefined 값들을 정리
    this.cleanupUndefinedValues(recordMap);

    return recordMap;
  }

  /**
   * RecordMap에서 undefined 값들을 정리
   */
  private cleanupUndefinedValues(recordMap: notion.ExtendedRecordMap) {
    const cleanObject = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj === undefined ? null : obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      }

      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = cleanObject(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue === undefined ? null : cleanedValue;
        }
      }
      return cleaned;
    };

    // 모든 블록 정리
    Object.keys(recordMap.block).forEach(blockId => {
      recordMap.block[blockId] = cleanObject(recordMap.block[blockId]);
    });

    // 다른 맵들도 정리
    Object.keys(recordMap.collection || {}).forEach(collectionId => {
      recordMap.collection![collectionId] = cleanObject(recordMap.collection![collectionId]);
    });

    Object.keys(recordMap.collection_view || {}).forEach(viewId => {
      recordMap.collection_view![viewId] = cleanObject(recordMap.collection_view![viewId]);
    });

    Object.keys(recordMap.notion_user || {}).forEach(userId => {
      recordMap.notion_user![userId] = cleanObject(recordMap.notion_user![userId]);
    });
  }

  /**
   * 블록들을 Legacy 형식으로 변환
   */
  private convertBlocksToLegacyFormat(blocks: any[], recordMap: notion.ExtendedRecordMap) {
    blocks.forEach(block => {
      const blockId = block.id.replace(/-/g, '');

      const legacyBlock = {
        role: 'editor' as notion.Role,
        value: {
          id: blockId,
          version: 1,
          type: this.convertBlockType(block.type) as notion.BlockType,
          properties: this.convertBlockProperties(block),
          format: this.convertBlockFormat(block),
          content: block.children
            ? block.children.map((child: any) => child.id.replace(/-/g, ''))
            : [],
          permissions: [
            {
              role: 'editor' as notion.Role,
              type: 'user_permission',
            },
          ],
          created_time: new Date(block.created_time).getTime(),
          last_edited_time: new Date(block.last_edited_time).getTime(),
          parent_id: block.parent?.page_id?.replace(/-/g, '') || 'parent',
          parent_table: 'block',
          alive: true,
          created_by_table: 'notion_user',
          created_by_id: this.extractUserId(block.created_by),
          last_edited_by_table: 'notion_user',
          last_edited_by_id: this.extractUserId(block.last_edited_by),
        } as notion.Block,
      };

      recordMap.block[blockId] = legacyBlock;

      // 자식 블록들도 재귀적으로 변환
      if (block.children && block.children.length > 0) {
        this.convertBlocksToLegacyFormat(block.children, recordMap);
      }
    });
  }

  /**
   * 블록 타입 변환
   */
  private convertBlockType(officialType: string): string {
    const typeMapping: { [key: string]: string } = {
      paragraph: 'text',
      heading_1: 'header',
      heading_2: 'sub_header',
      heading_3: 'sub_sub_header',
      bulleted_list_item: 'bulleted_list',
      numbered_list_item: 'numbered_list',
      to_do: 'to_do',
      toggle: 'toggle',
      child_page: 'page',
      child_database: 'collection_view_page',
      embed: 'embed',
      image: 'image',
      video: 'video',
      file: 'file',
      pdf: 'pdf',
      bookmark: 'bookmark',
      callout: 'callout',
      quote: 'quote',
      equation: 'equation',
      divider: 'divider',
      table_of_contents: 'table_of_contents',
      column: 'column',
      column_list: 'column_list',
      link_preview: 'link_preview',
      synced_block: 'transclusion_container',
      template: 'template',
      link_to_page: 'alias',
      table: 'table',
      table_row: 'table_row',
      code: 'code',
    };

    return typeMapping[officialType] || officialType;
  }

  /**
   * 블록 속성 변환
   */
  private convertBlockProperties(block: any): any {
    const properties: any = {};

    // 텍스트 내용 변환
    if (block.type === 'paragraph' && block.paragraph?.rich_text) {
      properties.title = this.convertRichText(block.paragraph.rich_text);
    } else if (block.type.startsWith('heading_') && block[block.type]?.rich_text) {
      properties.title = this.convertRichText(block[block.type].rich_text);
    } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
      properties.title = this.convertRichText(block.bulleted_list_item.rich_text);
    } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
      properties.title = this.convertRichText(block.numbered_list_item.rich_text);
    } else if (block.type === 'to_do' && block.to_do?.rich_text) {
      properties.title = this.convertRichText(block.to_do.rich_text);
      properties.checked = [['Yes']] as notion.Decoration[];
    } else if (block.type === 'toggle' && block.toggle?.rich_text) {
      properties.title = this.convertRichText(block.toggle.rich_text);
    } else if (block.type === 'callout' && block.callout?.rich_text) {
      properties.title = this.convertRichText(block.callout.rich_text);
    } else if (block.type === 'quote' && block.quote?.rich_text) {
      properties.title = this.convertRichText(block.quote.rich_text);
    } else if (block.type === 'code' && block.code?.rich_text) {
      properties.title = this.convertRichText(block.code.rich_text);
      properties.language = [['plain text']] as notion.Decoration[];
    }

    // 이미지/파일 URL 변환
    if (block.type === 'image' && block.image) {
      let imageUrl = '';
      if (block.image.type === 'external') {
        imageUrl = block.image.external.url;
      } else if (block.image.type === 'file') {
        imageUrl = block.image.file.url;
      }

      // 이미지 URL이 있는 경우에만 설정
      if (imageUrl) {
        properties.source = [[imageUrl]] as notion.Decoration[];
      }

      if (block.image.caption) {
        properties.caption = this.convertRichText(block.image.caption);
      }
    }

    // 파일 URL 변환
    if (block.type === 'file' && block.file) {
      if (block.file.type === 'external') {
        properties.source = [[block.file.external.url]] as notion.Decoration[];
      } else if (block.file.type === 'file') {
        properties.source = [[block.file.file.url]] as notion.Decoration[];
      }
      if (block.file.caption) {
        properties.caption = this.convertRichText(block.file.caption);
      }
    }

    // 북마크 URL 변환
    if (block.type === 'bookmark' && block.bookmark) {
      properties.link = [[block.bookmark.url]] as notion.Decoration[];
      if (block.bookmark.caption) {
        properties.caption = this.convertRichText(block.bookmark.caption);
      }
    }

    // 테이블 행 셀 데이터 변환
    if (block.type === 'table_row' && block.table_row?.cells) {
      block.table_row.cells.forEach((cell: any[], index: number) => {
        if (cell && cell.length > 0) {
          properties[index.toString()] = this.convertRichText(cell);
        } else {
          properties[index.toString()] = [['']];
        }
      });
    }

    return properties;
  }

  /**
   * 블록 포맷 변환
   */
  private convertBlockFormat(block: any): any {
    const format: any = {};

    // 색상 변환
    if (block.type === 'callout' && block.callout) {
      if (block.callout.color && block.callout.color !== 'default') {
        format.block_color = block.callout.color;
      }
      if (block.callout.icon) {
        if (block.callout.icon.type === 'emoji') {
          format.page_icon = block.callout.icon.emoji;
        } else if (block.callout.icon.type === 'external') {
          format.page_icon = block.callout.icon.external.url;
        }
      }
    }

    // 코드 블록 언어
    if (block.type === 'code' && block.code?.language) {
      format.code_wrap = true;
    }

    // 테이블 format 처리
    if (block.type === 'table' && block.table) {
      // 테이블 컬럼 순서와 포맷 정보 생성
      const tableWidth = block.table.table_width || 0;
      if (tableWidth > 0) {
        // 컬럼 순서 생성 (0부터 시작하는 인덱스)
        format.table_block_column_order = Array.from({ length: tableWidth }, (_, i) =>
          i.toString(),
        );

        // 기본 컬럼 포맷 생성
        format.table_block_column_format = {};
        for (let i = 0; i < tableWidth; i++) {
          format.table_block_column_format[i.toString()] = {
            width: 120,
          };
        }
      }
    }

    // undefined 값들을 null로 변환하거나 제거
    Object.keys(format).forEach(key => {
      if (format[key] === undefined) {
        format[key] = null;
      }
    });

    return format;
  }

  /**
   * Rich Text를 Legacy 형식으로 변환
   */
  private convertRichText(richText: any[]): notion.Decoration[] {
    if (!richText || richText.length === 0) {
      return [['']];
    }

    return richText.map(text => {
      const content = text.plain_text || '';
      const annotations = text.annotations || {};

      const formatting: any[] = [];
      if (annotations.bold) formatting.push(['b']);
      if (annotations.italic) formatting.push(['i']);
      if (annotations.strikethrough) formatting.push(['s']);
      if (annotations.underline) formatting.push(['_']);
      if (annotations.code) formatting.push(['c']);
      if (text.href) formatting.push(['a', text.href]);
      if (annotations.color && annotations.color !== 'default') {
        formatting.push(['h', annotations.color]);
      }

      if (formatting.length > 0) {
        return [content, formatting] as notion.Decoration;
      } else {
        return [content] as notion.Decoration;
      }
    });
  }

  /**
   * 페이지 제목 추출
   */
  private extractTitle(page: any): notion.Decoration[] {
    if (page.properties?.title?.title) {
      return this.convertRichText(page.properties.title.title);
    }
    if (page.properties?.Name?.title) {
      return this.convertRichText(page.properties.Name.title);
    }
    return [['Untitled']];
  }

  /**
   * 페이지 아이콘 추출
   */
  private extractIcon(page: any): string | undefined {
    if (page.icon) {
      if (page.icon.type === 'emoji') {
        return page.icon.emoji;
      } else if (page.icon.type === 'external') {
        return page.icon.external.url;
      } else if (page.icon.type === 'file') {
        return page.icon.file.url;
      }
    }
    return undefined;
  }

  /**
   * 페이지 커버 추출
   */
  private extractCover(page: any): string | undefined {
    if (page.cover) {
      if (page.cover.type === 'external') {
        return page.cover.external.url;
      } else if (page.cover.type === 'file') {
        return page.cover.file.url;
      }
    }
    return undefined;
  }

  /**
   * 사용자 ID 추출
   */
  private extractUserId(user: any): string {
    if (user && user.id) {
      return user.id.replace(/-/g, '');
    }
    return 'unknown_user';
  }

  /**
   * 공식 API를 사용하여 페이지를 가져오고 Legacy 형식으로 변환
   */
  async getPage(pageId: string): Promise<notion.ExtendedRecordMap> {
    try {
      // 공식 API로 페이지와 블록들 가져오기
      const [page, blocks] = await Promise.all([
        this.getPageInfo(pageId),
        this.getAllPageBlocks(pageId),
      ]);

      // Legacy 형식으로 변환
      return this.convertPageToLegacyFormat(page, blocks);
    } catch (error) {
      console.error('Error in NotionAdapter.getPage:', error);
      throw error;
    }
  }

  /**
   * 페이지 정보 가져오기
   */
  private async getPageInfo(pageId: string) {
    const parsedPageId = parsePageId(pageId);
    if (!parsedPageId) {
      throw new Error(`Invalid notion pageId "${pageId}"`);
    }

    try {
      const page = await this.client.pages.retrieve({
        page_id: parsedPageId,
      });
      return page;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  /**
   * 페이지의 블록들 가져오기
   */
  private async getPageBlocks(pageId: string, startCursor?: string) {
    const parsedPageId = parsePageId(pageId);
    if (!parsedPageId) {
      throw new Error(`Invalid notion pageId "${pageId}"`);
    }

    try {
      const blocks = await this.client.blocks.children.list({
        block_id: parsedPageId,
        start_cursor: startCursor,
        page_size: 100,
      });
      return blocks;
    } catch (error) {
      console.error('Error fetching page blocks:', error);
      throw error;
    }
  }

  /**
   * 모든 페이지 블록들을 재귀적으로 가져오기
   */
  private async getAllPageBlocks(pageId: string): Promise<any[]> {
    const allBlocks: any[] = [];
    let startCursor: string | undefined;

    do {
      const response = await this.getPageBlocks(pageId, startCursor);
      allBlocks.push(...response.results);

      if (response.has_more && response.next_cursor) {
        startCursor = response.next_cursor;
      } else {
        startCursor = undefined;
      }
    } while (startCursor);

    // 중첩된 블록들도 가져오기
    const blocksWithChildren = await Promise.all(
      allBlocks.map(async block => {
        if (block.has_children) {
          try {
            const children = await this.getAllPageBlocks(block.id);
            return { ...block, children };
          } catch (error) {
            console.warn(`Failed to fetch children for block ${block.id}:`, error);
            return block;
          }
        }
        return block;
      }),
    );

    return blocksWithChildren;
  }

  /**
   * 검색 기능 (공식 API 사용)
   */
  async search(params: notion.SearchParams): Promise<notion.SearchResults> {
    try {
      const searchOptions: any = {
        query: params.query,
        page_size: params.limit || 20,
      };

      // ancestorId가 있으면 필터 추가
      if (params.ancestorId) {
        searchOptions.filter = {
          value: 'page',
          property: 'object',
        };
      }

      const results = await this.client.search({
        query: params.query,
        ...searchOptions,
      });

      // Legacy 형식으로 변환
      return {
        recordMap: {
          block: {},
          collection: {},
          collection_view: {},
          notion_user: {},
        },
        results: results.results.map((result: any) => ({
          id: result.id.replace(/-/g, ''),
          isNavigable: true,
          score: 1.0,
          highlight: {
            pathText: result.url || '',
            text: this.extractSearchText(result),
          },
        })),
        total: results.results.length,
      };
    } catch (error) {
      console.error('Error in NotionAdapter.search:', error);
      throw error;
    }
  }

  /**
   * 검색 결과에서 텍스트 추출
   */
  private extractSearchText(result: any): string {
    if (result.properties?.title?.title) {
      return result.properties.title.title.map((t: any) => t.plain_text).join('');
    }
    if (result.properties?.Name?.title) {
      return result.properties.Name.title.map((t: any) => t.plain_text).join('');
    }
    return 'Untitled';
  }
}
