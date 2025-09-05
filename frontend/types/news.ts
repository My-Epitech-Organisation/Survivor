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

export interface NewsFilter {
    category: string | null;
    location: string | null;
}
