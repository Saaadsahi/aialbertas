export type ForumPostType = "standard" | "cinematic_crawl";
export type ForumPostStatus = "draft" | "published";
export type ForumReactionType = "boost" | "signal" | "orbit";

export type SessionForumUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "user";
};

export type CinematicCrawlRecord = {
  id: string;
  user_id: string;
  full_name: string | null;
  post_type: "cinematic_crawl";
  status: ForumPostStatus;
  subject: string;
  body: string;
  crawl_title: string | null;
  crawl_duration: number;
  crawl_tilt: number;
  crawl_font_size: number;
  crawl_show_stars: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CrawlCommentRecord = {
  id: string;
  post_id: string;
  user_id: string;
  full_name: string | null;
  body: string;
  created_at: string;
};

export type CrawlReactionRecord = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ForumReactionType;
  created_at: string;
};
