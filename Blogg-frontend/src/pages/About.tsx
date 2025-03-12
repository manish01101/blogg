import Appbar from "../components/Appbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4ED]">
      {/* Appbar */}
      <Appbar />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="p-5 text-center">
          <h1 className="text-4xl font-bold text-gray-700">About Us</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Welcome to <span className="font-semibold">Blogg</span>, your
            ultimate destination for insightful blogs on various topics. We are
            committed to sharing knowledge and ideas with the world.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mt-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-700">Our Mission</h2>
            <p className="text-lg text-gray-600 mt-4">
              At <span className="font-semibold">Blogg</span>, our mission is to
              empower individuals with knowledge, spark creativity, and provide
              a platform for voices that need to be heard. We believe in the
              power of words to inspire, educate, and connect people worldwide.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mt-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-700">Our Vision</h2>
            <p className="text-lg text-gray-600 mt-4">
              We envision a world where ideas and stories are shared freely,
              creating a community of learners, thinkers, and storytellers.
              Whether you're an experienced writer or just starting, Blogg is a
              space for you to explore, express, and engage.
            </p>
          </div>
        </section>

        {/* Why Choose Blogg Section */}
        <section className="mt-10 px-4 pb-3">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-700">
              Why Choose Blogg?
            </h2>
            <ul className="text-lg text-gray-600 mt-4 space-y-3">
              <li>📝 A platform for creative expression</li>
              <li>📚 A vast range of topics from experts & enthusiasts</li>
              <li>🌎 A global community of writers and readers</li>
              <li>🚀 Easy-to-use and reader-friendly interface</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
