export const FullscreenIcon = (props: { className: string }) => {
  return (
    <svg className={props.className} height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <g className="ytp-fullscreen-button-corner-0">
        <use className="fill-none stroke-black/[.15] stroke-2" />
        <path
          className="fill-white"
          d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"
          id="ytp-id-203"
        ></path>
      </g>
      <g className="ytp-fullscreen-button-corner-1">
        <use className="fill-none stroke-black/[.15] stroke-2" />
        <path
          className="fill-white"
          d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"
          id="ytp-id-204"
        ></path>
      </g>
      <g className="ytp-fullscreen-button-corner-2">
        <use className="fill-none stroke-black/[.15] stroke-2" />
        <path
          className="fill-white"
          d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"
          id="ytp-id-205"
        ></path>
      </g>
      <g className="ytp-fullscreen-button-corner-3">
        <use className="fill-none stroke-black/[.15] stroke-2" />
        <path
          className="fill-white"
          d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"
          id="ytp-id-206"
        ></path>
      </g>
    </svg>
  );
};
