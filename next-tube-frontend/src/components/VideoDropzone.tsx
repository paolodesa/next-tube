import { type DropzoneState } from "react-dropzone";
import { WarningIcon } from "~/icons/Warning";

export const VideoDropzone = (props: { dropzone: DropzoneState, errorMessage: string | undefined }) => {
  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
  } = props.dropzone;

  return (
    <div
      {...getRootProps()}
      className="flex h-full w-full flex-col items-center justify-center text-center"
    >
      <input {...getInputProps()} />
      <button
        onClick={open}
        className="flex h-[136px] w-[136px] flex-col items-center justify-center rounded-full bg-[#f9f9f9] dark:bg-[#1f1f1f]"
      >
        <div className="w-[38px] border-x-[19px] border-b-[21px] border-x-transparent border-b-[#909090]"></div>
        <div
          className={`${
            isDragActive ? "h-1.5 scale-x-[1.375]" : "h-4"
          } w-4 origin-bottom bg-[#909090] duration-200`}
        ></div>
        <div className="mt-2.5 w-10 border-b-[6px] border-[#909090]"></div>
      </button>
      <span className="mt-8 text-[15px] font-light">
        Drag and drop a video file to upload
      </span>
      <span className="mt-1 text-[13px] text-text-secondary dark:text-text-secondary-dark">
        Your video will be private until you publish it.
      </span>
      {props.errorMessage && <span className="mt-6 text-[13px] font-light flex items-center">
        <WarningIcon className="h-5 mr-3 fill-[#ff4e45]" />
        {props.errorMessage}
      </span>}
      <button
        onClick={open}
        className={`mt-8 h-min rounded-sm px-3.5 py-2 text-sm dark:font-semibold bg-yt-blue text-white dark:bg-yt-blue-dark dark:text-[#0d0d0d]`}
      >
        SELECT FILE
      </button>
    </div>
  );
};
