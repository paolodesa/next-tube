import Link from "next/link";
import { useRouter } from "next/router";
import { ProfileIcon } from "~/icons/Profile";

export const LoginBtn = () => {
  const router = useRouter();
  const redirectPath = router.asPath.slice(1);

  return (
    <Link
      href={{
        pathname: "/login",
        query: redirectPath !== "" ? { redirectTo: redirectPath } : "",
      }}
      className="ml-2 flex items-center justify-center gap-1 rounded-full border-[1px] border-stone-200 py-1.5 pl-2.5 pr-3.5 text-yt-blue hover:border-transparent hover:bg-[#def1ff] dark:border-stone-800 dark:text-yt-blue-dark dark:hover:bg-[#263850]"
    >
      <ProfileIcon />
      <span className="text-[0.9rem] font-medium">Sign in</span>
    </Link>
  );
};
