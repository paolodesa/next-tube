export const HomeIcon = (props: { filled: boolean }) => {
  return props.filled ? (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className="style-scope yt-icon h-6"
    >
      <g className="style-scope yt-icon dark:fill-white">
        <path
          d="M4,10V21h6V15h4v6h6V10L12,3Z"
          className="style-scope yt-icon"
        ></path>
      </g>
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className="style-scope yt-icon h-6"
    >
      <g className="style-scope yt-icon dark:fill-white">
        <path
          d="M12,4.33l7,6.12V20H15V14H9v6H5V10.45l7-6.12M12,3,4,10V21h6V15h4v6h6V10L12,3Z"
          className="style-scope yt-icon"
        ></path>
      </g>
    </svg>
  );
};
