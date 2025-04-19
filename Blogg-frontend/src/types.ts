export interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  authorName?: string;
  likes: number;
  createdAt: Date;
}

export interface BlogCardProps {
  blog: Blog;
}

export interface SignupInput {
  email: string;
  password: string;
}

export interface btnType {
  onclick?: () => void;
  content: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
