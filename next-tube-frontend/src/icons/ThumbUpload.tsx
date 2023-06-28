export const ThumbUploadIcon = (props: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={`${props.className ?? ""} style-scope yt-icon h-6`}
    >
      <g
        mirror-in-rtl=""
        className="style-scope yt-icon"
      >
        <path
          d="M14,13.6l2.8,3.4h-5.4l0.3-0.4L14,13.6 M8.9,14.7l1.2,1.9l0.3,0.4H7.1L8.9,14.7 M14,12l-3,4l-2-3l-4,5h14L14,12L14,12z
	          M21,7h-2v2h-2V7h-2V5h2V3h2v2h2V7z M13,4v6v1h1h6v9H4V4H13 M14,3H3v18h18V10h-7V3L14,3z"
          className="style-scope tp-yt-iron-icon"
        ></path>
      </g>
    </svg>
  );
};
