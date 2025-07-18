export interface Post {
  slug: string;
  title: string;
  content: string;
  date: string;
  category: 'development' | 'series' | 'til' | 'ai';
  series?: string;
  seriesOrder?: number;
  readingTime: string;
  excerpt: string;
}

export interface PostMeta {
  title: string;
  date: string;
  category: string;
  series?: string;
  seriesOrder?: number;
}