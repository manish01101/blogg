import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Blog } from "../types";
import Loading from "../components/Loading";

const Trash = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  // track loading for bulk actions
  const [bulkRestoring, setBulkRestoring] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // track loading for single blog
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/v1/blog/user/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // toggle individual selection
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // Select/unselect all blogs
  const toggleSelectAll = () => {
    if (selected.length === blogs.length) {
      setSelected([]);
    } else {
      setSelected(blogs.map((b) => b.id));
    }
  };

  // Bulk restore
  const restoreSelected = async () => {
    if (selected.length === 0) return;
    setBulkRestoring(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/blog/restore/bulk`,
        { ids: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelected([]);
      fetchTrash();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkRestoring(false);
    }
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Delete permanently? This cannot be undone.")) return;
    setBulkDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/permanent/bulk`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selected },
      });
      setSelected([]);
      fetchTrash();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Single restore
  const restoreBlog = async (id: string) => {
    setRestoringId(id);
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/blog/restore/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTrash();
    } catch (err) {
      console.error(err);
    } finally {
      setRestoringId(null);
    }
  };

  // Single delete
  const deleteForever = async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/permanent/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrash();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        {/* Trash title + Select All together */}
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-gray-800">🗑 Trash</h2>

          {blogs.length > 0 && (
            <label className="flex gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.length === blogs.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm">Select All</span>
            </label>
          )}
        </div>

        {/* Bulk actions on the right side */}
        {blogs.length > 0 && selected.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={restoreSelected}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
              disabled={bulkRestoring}
            >
              {bulkRestoring ? "Restoring..." : `Restore (${selected.length})`}
            </button>
            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition disabled:opacity-50"
              disabled={bulkDeleting}
            >
              {bulkDeleting
                ? "Deleting..."
                : `Delete Permanently (${selected.length})`}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : blogs.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No deleted blogs 🎉</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className={`p-5 border rounded-xl shadow-sm transition ${
                selected.includes(blog.id)
                  ? "bg-green-50 border-green-400"
                  : "bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Individual checkbox */}
                <input
                  type="checkbox"
                  checked={selected.includes(blog.id)}
                  onChange={() => toggleSelect(blog.id)}
                  className="mt-1 w-4 h-4 accent-green-600"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {blog.content.slice(0, 120)}...
                  </p>

                  {/* Individual actions */}
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => restoreBlog(blog.id)}
                      disabled={restoringId === blog.id}
                      className="px-3 py-1 bg-green-500 text-white rounded-md text-sm disabled:opacity-50"
                    >
                      {restoringId === blog.id ? "Restoring..." : "Restore"}
                    </button>
                    <button
                      onClick={() => deleteForever(blog.id)}
                      disabled={deletingId === blog.id}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm disabled:opacity-50"
                    >
                      {deletingId === blog.id
                        ? "Deleting..."
                        : "Delete Permanently"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Trash;
