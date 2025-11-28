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
  birth_date?: string | null;
  updated_at?: string;
  created_at?: string;
  slug?: string;
  email?: string;
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
  profile?: Profile;
  profile_slug?: string;
  profile_name?: string;
  profile_avatar_url?: string;
}

export interface UserProfile extends Profile {
  // UserProfile now inherits all properties from Profile and can add more if needed
}
