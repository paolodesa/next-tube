export const DeleteIcon = (props: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={`${props.className ?? ""} style-scope yt-icon`}
    >
      <g mirror-in-rtl="" className="style-scope yt-icon">
        <path
          d="M11,17H9V8h2V17z M15,8h-2v9h2V8z M19,4v1h-1v16H6V5H5V4h4V3h6v1H19z M17,5H7v15h10V5z"
          className="style-scope tp-yt-iron-icon"
        ></path>
      </g>
    </svg>
  );
};
