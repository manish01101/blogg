import { useState } from "react";
import axios from "axios";
import Button from "../components/Button";
import { BACKEND_URL } from "../config";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/v1/contact`, form, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess(data.success || "Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setSuccess(
        error.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-700">Contact Us</h1>
      <p className="text-lg text-gray-600 mt-4">
        Have questions? Reach out to us and we'll get back to you soon.
      </p>
      <div className="mt-6 max-w-lg mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            onChange={handleChange}
            value={form.name}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            onChange={handleChange}
            value={form.email}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            className="w-full p-2 mb-4 border border-gray-300 rounded h-32"
            onChange={handleChange}
            value={form.message}
            required
          ></textarea>

          <Button
            type="submit"
            disabled={loading}
            content={loading ? "Sending..." : "Send Message"}
          />
        </form>

        {success && (
          <p className={`mt-4 text-center ${success.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
            {success}
          </p>
        )}
      </div>
    </div>
  );
};

export default Contact;
