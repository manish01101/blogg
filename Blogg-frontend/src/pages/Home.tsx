const Home = () => {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <header className="text-center py-20">
        <h2 className="text-4xl font-black">Welcome to Blogg</h2>
        <p className="text-lg mt-2">
          Discover amazing articles on various topics written by passionate
          bloggers.
        </p>
      </header>

      {/* Blog Posts */}
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-semibold text-gray-800 mb-6">
          Latest Posts
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Blog Post Card */}
          {[
            {
              title: "How to Start a Blog",
              desc: "A beginner’s guide to creating your own blog...",
            },
            {
              title: "SEO Tips for Bloggers",
              desc: "Boost your blog’s visibility with these SEO strategies...",
            },
            {
              title: "Monetizing Your Blog",
              desc: "Learn how to make money from your blog...",
            },
          ].map((post, index) => (
            <div key={index} className="bg-white shadow-md p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-gray-800">
                {post.title}
              </h4>
              <p className="text-gray-600 mt-2">{post.desc}</p>
              <a href="#" className="text-blue-400 mt-3 inline-block">
                Read more →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
