const Footer = () => {
  return (
    <footer className="bg-gray-500 text-white text-center p-4 mt-auto">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <span className="font-semibold">Blogg</span>. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
