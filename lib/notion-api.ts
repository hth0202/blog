import { Client } from '@notionhq/client';
import * as notionTypes from 'notion-types';
import { parsePageId } from 'notion-utils';
import { NotionAdapter } from './notion-adapter';

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});
const notionAdapter = new NotionAdapter(notionClient);

export const notion = {
  // 페이지 가져오기
  getPage: async (pageId: string, options: any = {}): Promise<notionTypes.ExtendedRecordMap> => {
    return await notionAdapter.getPage(pageId);
  },

  // 검색 기능
  search: async (params: notionTypes.SearchParams): Promise<notionTypes.SearchResults> => {
    return await notionAdapter.search(params);
  },
};
