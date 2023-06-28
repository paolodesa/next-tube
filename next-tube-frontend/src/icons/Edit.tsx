export const EditIcon = (props: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className={`${props.className ?? ""} style-scope yt-icon`}
    >
      <g mirror-in-rtl="" className="style-scope yt-icon">
        <path
          d="M14.06 7.6L16.4 9.94L6.34 20H4V17.66L14.06 7.6ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19ZM17.61 4.05L19.98 6.42L18.84 7.56L16.47 5.19L17.61 4.05ZM17.61 2.63L15.06 5.18L18.85 8.97001L21.4 6.42L17.61 2.63Z"
          className="style-scope tp-yt-iron-icon"
        ></path>
      </g>
    </svg>
  );
};
