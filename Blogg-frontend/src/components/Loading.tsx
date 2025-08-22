const Loading = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-5 space-y-4">
      {/* Pulsing circles */}
      <div className="flex items-center justify-center h-[30vh]">
        <div
          className="h-[1.2em] w-[1.2em] rounded-full m-2 bg-gray-800"
          style={{
            animation: "pulseDot 1s infinite alternate",
          }}
        ></div>
        <div
          className="h-[1.2em] w-[1.2em] rounded-full m-2 bg-gray-800"
          style={{
            animation: "pulseDot 1s infinite alternate",
            animationDelay: "0.2s",
          }}
        ></div>
        <div
          className="h-[1.2em] w-[1.2em] rounded-full m-2 bg-gray-800"
          style={{
            animation: "pulseDot 1s infinite alternate",
            animationDelay: "0.4s",
          }}
        ></div>
      </div>

      {/* Inline keyframes using Tailwind color values */}
      <style>
        {`
          @keyframes pulseDot {
            from {
              background-color: rgb(31 41 55); /* Tailwind bg-gray-800 as it's not working in raw css keyframes*/
              transform: scale(1);
            }
            to {
              background-color: rgb(209 213 219); /* Tailwind bg-gray-300 */
              transform: scale(1.33);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;
