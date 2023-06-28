import Link from "next/link";

export const NTLogo = (props: { countryCode: string }) => {
  return (
    <Link
      href="/"
      title="NextTube Home"
      className="flex h-full py-[1.15rem] pl-4 w-[116px]"
    >
      <h1 className="dark:text-white self-center font-semibold text-lg">NextTube</h1>
      <span className="-mt-2 ml-1 text-[10px] text-text-secondary dark:text-text-secondary-dark">
        {props.countryCode}
      </span>
    </Link>
  );
};
