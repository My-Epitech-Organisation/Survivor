
export interface NewsSearchEntity {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  news_date: string;
  result_type: string;
}

export interface EventSearchEntity {
  id: number;
  name: string;
  description: string;
  event_type: string;
  location: string;
  dates: string;
  result_type: string;
}

export interface SearchProjectFounder {
  id: number;
  name: string;
}

export interface ProjectSearchEntity {
  id: number;
  name: string;
  description?: string;
  sector: string;
  maturity: string;
  address: string;
  website_url: string;
  project_status: string;
  founders: SearchProjectFounder[];
  result_type: string;
}

export type ItemEntity = NewsSearchEntity | EventSearchEntity | ProjectSearchEntity;

export interface SearchItem {
  title: string;
  description: string;
  score: number;
  id: number;
  type: string;
  entity: ItemEntity;
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchItem[];
}
