import { atom } from "recoil";
import { Blog } from "../../types";

export const blogState = atom<Blog[]>({
  key: "blogState",
  default: [], // Default empty array
});
