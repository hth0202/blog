import { parsePageId } from 'notion-utils';

export const DATABASE_ID = {
  POST: parsePageId(process.env.NOTION_DATABASE_POST_LINK),
};
