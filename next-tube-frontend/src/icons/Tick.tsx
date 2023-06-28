export const TickIcon = (props: {className: string, white: boolean}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={props.className}
    >
      <g mirror-in-rtl="" className="style-scope yt-icon">
        <path
          d="M9,18.7l-5.4-5.4l0.7-0.7L9,17.3L20.6,5.6l0.7,0.7L9,18.7z"
          className={`style-scope yt-icon ${props.white ? "fill-[#eee]" : ""}`}
        ></path>
      </g>
    </svg>
  );
};
