export interface NewsItem {
  id: number;
  title: string;
  category: string;
  news_date: string;
  location: string;
  startup_id: number;
}

export interface NewsDetailItem extends NewsItem {
  description: string;
  pictureURL: string;
}

export interface NewsCardProps {
    item: NewsItem;
}

export interface NewsFiltersProps {
    categories: string[];
    locations: string[];
    onFiltersChange?: (filters: {
        categories: string[];
        locations: string[];
        dateRange: string | null;
    }) => void;
}
