// Notion API Request/Response Types
export interface NotionAPIRequest {
    filter?: NotionFilter;
    sorts?: NotionSort[];
    page_size?: number;
    start_cursor?: string;
    query?: string;
    parent?: NotionParent;
    properties?: Record<string, NotionPropertyValue>;
    children?: NotionBlock[];
}

export interface NotionAPIResponse {
    results: unknown[];
    next_cursor?: string | null;
    has_more: boolean;
    object: string;
    id: string;
    url: string;
    created_time: string;
    last_edited_time: string;
    properties: Record<string, NotionPropertyValue>;
}

export interface NotionFilter {
    property: string;
    value: string;
    [key: string]: unknown;
}

export interface NotionSort {
    property: string;
    direction: 'ascending' | 'descending';
    [key: string]: unknown;
}

export interface NotionParent {
    page_id?: string;
    database_id?: string;
    type: 'page_id' | 'database_id';
}

export interface NotionPropertyValue {
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

export interface NotionBlock {
    object: 'block';
    id: string;
    type: string;
    [key: string]: unknown;
}

export interface NotionDatabaseRequest {
    parent: NotionParent;
    title: NotionRichText[];
    properties: Record<string, NotionPropertyValue>;
}

export interface NotionPageRequest {
    parent: NotionParent;
    properties: Record<string, NotionPropertyValue>;
}
