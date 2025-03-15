const Footer = () => {
  return (
    <footer className="text-gray-500 text-center p-4 mt-auto shadow-[0_-5px_10px_rgba(0,0,0,0.1)]">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <span className="font-semibold">Blogg</span>. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
