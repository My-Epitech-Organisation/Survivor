export interface SearchItem {
  title: string;
  description: string;
  score: number;
  id: number;
  type: string;
  entity: any;
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchItem[];
}
