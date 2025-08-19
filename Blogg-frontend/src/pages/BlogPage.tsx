import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useState, useEffect } from "react";
import { blogState, homeBlogState } from "../store/atoms/blogs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Loading from "../components/Loading";
import { Blog } from "../types";
import toast from "react-hot-toast";

const BlogPage = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Determine which blog state to use
  const fromHome = location.state?.from === "home";
  const blogs = useRecoilValue(fromHome ? homeBlogState : blogState);
  const setBlogs = useSetRecoilState(fromHome ? homeBlogState : blogState);

  const blogId = location.state?.blog?.id;
  const initialBlog = blogs.find((b) => b.id === blogId);
  const [fetchedBlog, setFetchedBlog] = useState<Blog | null>(
    initialBlog || null
  );

  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(initialBlog?.likes || 0);

  // Fetch blog if not available in state
  useEffect(() => {
    const fetchBlog = async () => {
      if (!token) {
        setError("Unauthorized: No token found.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/blog/${blogId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFetchedBlog(response.data.post);
        setTotalLikes(response.data.post.likes);
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.message);
        } else {
          setError("Something went wrong!");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!initialBlog) {
      fetchBlog();
    }
  }, [blogId, token, initialBlog]);

  useEffect(() => {
    if (fetchedBlog) {
      setTotalLikes(fetchedBlog.likes);
    }
  }, [fetchedBlog]);

  const handleLike = async () => {
    if (!fetchedBlog) return;

    try {
      const newLikedState = !liked;
      const updatedTotalLikes = newLikedState ? totalLikes + 1 : totalLikes - 1;

      setLiked(newLikedState);
      setTotalLikes(updatedTotalLikes);

      const response = await axios.put(
        `${BACKEND_URL}/api/v1/blog/like/${fetchedBlog.id}`,
        { increment: newLikedState },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setBlogs((prevBlogs) =>
          prevBlogs.map((b) =>
            b.id === fetchedBlog.id ? { ...b, likes: updatedTotalLikes } : b
          )
        );
      }
    } catch (error) {
      console.error("Error updating like status", error);
      toast.error("Failed to update like. Please try again.");

      setLiked((prev) => !prev);
      setTotalLikes((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!fetchedBlog) return <p className="text-center">Blog not found</p>;

  return (
    <div className="flex flex-col">
      <div className="w-full bg-gray-50 sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto p-6 mb-6 shadow-lg rounded-lg mt-10">
        {fetchedBlog.coverImage && (
          <div className="flex justify-center item-center">
            <img
              src={fetchedBlog.coverImage}
              alt={fetchedBlog.title}
              className="h-50 object-cover rounded-md"
            />
          </div>
        )}
        <h1 className="text-5xl font-extrabold text-gray-900 mt-6 leading-snug">
          {fetchedBlog.title}
        </h1>
        <div className="text-gray-500 pt-2 text-sm flex flex-row">
          <span>
            By <strong>{fetchedBlog.authorName || "Unknown"}</strong> •{" "}
            {fetchedBlog.createdAt
              ? new Date(fetchedBlog.createdAt)
                  .toDateString()
                  .split(" ")
                  .slice(1, 3)
                  .join(" ")
              : "Unknown Date"}
          </span>
          <span className="mx-2">•</span>
          <span
            className="flex items-center cursor-pointer"
            onClick={handleLike}
          >
            {liked ? "❤️ Liked" : "🩵 Like"} ({totalLikes})
          </span>
        </div>
        <div
          className="prose max-w-none text-gray-800 pt-6 pb-10 text-lg leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(fetchedBlog.content),
          }}
        />
      </div>
    </div>
  );
};

export default BlogPage;
