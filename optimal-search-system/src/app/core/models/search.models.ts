export interface SearchResult {
    word: string;
    meaning: string;
}

export interface SearchApiResponse {
    results: SearchResult[];
    total: number;
    query: string;
    limit: number;
    start: number;
}

export type SearchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: SearchResult[] }
    | { status: 'error'; message: string }
    | { status: 'empty' };

export interface SearchConfig {
    placeholder: string;
    debounceMs: number;
    minQueryLength: number;
    maxResults: number;
}

export const DEFAULT_SEARCH_CONFIG: Readonly<SearchConfig> = {
    placeholder: 'Search ',
    debounceMs: 300,
    minQueryLength: 2,
    maxResults: 20,
} as const;