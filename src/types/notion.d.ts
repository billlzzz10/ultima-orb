// Type definitions for Notion API
export interface NotionPage {
  id: string;
  title: string;
  url: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionProperty {
  id: string;
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  name?: NotionRichText[];
  [key: string]: unknown;
}

export interface NotionRichText {
  type: 'text';
  text: {
    content: string;
    link?: string | null;
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string | null;
}

export interface NotionSearchResponse {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface NotionDatabaseResponse {
  results: NotionDatabase[];
  next_cursor: string | null;
  has_more: boolean;
}
