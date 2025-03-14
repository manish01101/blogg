import { selectorFamily } from "recoil";
import { blogState } from "../atoms/blogs";

export const likesSelector = selectorFamily<number, string>({
  key: "likesSelector",
  get: (blogId) => ({ get }) => {
    const blogs = get(blogState);
    const blog = blogs.find((b) => b.id === blogId);
    return blog ? blog.likes : 0;
  },
});
