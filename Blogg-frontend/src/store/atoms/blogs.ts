import { atom } from "recoil";

interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
}

export const blogState = atom<Blog[]>({
  key: "blogState",
  default: [], // Default empty array
});
