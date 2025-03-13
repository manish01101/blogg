import Button from "../components/Button";

const Contact = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-700">Contact Us</h1>
      <p className="text-lg text-gray-600 mt-4">
        Have questions? Reach out to us and we'll get back to you soon.
      </p>
      <div className="mt-6 max-w-lg mx-auto bg-gray-100 p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <textarea
          placeholder="Your Message"
          className="w-full p-2 mb-4 border border-gray-300 rounded h-32"
        ></textarea>
        <Button onclick={() => {}} content="Send Message" />
      </div>
    </div>
  );
};

export default Contact;
