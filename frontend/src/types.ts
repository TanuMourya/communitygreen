export interface User {
  id: number;
  name: string;
  email: string;
  points: number;
  created_at: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  photo_url?: string;
  latitude: number;
  longitude: number;
  category?: string;
  severity: string;
  status: string;
  upvotes: number;
  user_id: number;
  created_at: string;
}