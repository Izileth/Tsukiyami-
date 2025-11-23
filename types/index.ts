export type Profile = {
  id: string;
  name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  role?: "ADM" | "US";
  position?: string;
  social_media_links?: any;
  website?: string;
  location?: string;
  birth_date?: string | null; // ISO date string
  updated_at?: string; // ISO date-time string
  created_at?: string; // ISO date-time string
  slug?: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
};

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PostImage {
  id: number;
  image_url: string;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  content: string;
  description: string;
  slug: string;
  likes_count: number;
  views_count: number;
  dislikes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  post_images: PostImage[];
  categories: Category[];
  tags: Tag[];
  profile: Profile;
}

export interface UserProfile {
  id: string;
  avatar_url?: string;
  banner_url?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  slug?: string;
  position?: string;
  email?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  website?: string;
  location?: string;
  birth_date?: string;
  social_media_links?: any;
  role?: string;
}
