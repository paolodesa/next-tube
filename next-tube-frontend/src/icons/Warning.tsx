export const WarningIcon = (props: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={`${props.className ?? ""} style-scope yt-icon`}
    >
      <g mirror-in-rtl="" className="style-scope yt-icon">
        <path
          d="M13 18H11V16H13V18ZM13 10H11V15H13V10ZM12 5.89L20.2 19H3.8L12 5.89ZM12 4L2 20H22L12 4Z"
          className="style-scope tp-yt-iron-icon"
        ></path>
      </g>
    </svg>
  );
};
