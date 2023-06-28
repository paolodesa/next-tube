import { useRef } from "react";
import { MenuIcon } from "~/icons/Menu";
import useOnClickOutside from "~/utils/outsideClickHook";
import { NTLogo } from "./NTLogo";
import { SearchIcon } from "~/icons/Search";
import { KebabIcon } from "~/icons/Kebab";
import { SettingsMenu } from "./SettingsMenu";
import { LoginBtn } from "./LoginBtn";
import { useAtom } from "jotai";
import {
  settingsMenuOpenAtom,
  sideMenuCompactAtom,
  sideMenuOpenAtom,
} from "~/utils/atoms";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { AddVideoIcon } from "~/icons/AddVideo";
import { api } from "~/utils/api";
import Image from "next/image";

export const Header = () => {
  const [settingsMenuOpen, setSettingsMenuOpen] = useAtom(settingsMenuOpenAtom);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useUser();
  const { data: channel } = api.channel.getByCurrentUser.useQuery();

  const [, setSideMenuOpen] = useAtom(sideMenuOpenAtom);
  const [, setSideMenuCompact] = useAtom(sideMenuCompactAtom);

  useOnClickOutside(settingsMenuRef, () => setSettingsMenuOpen(false));

  return (
    <>
      <header className="fixed z-40 flex h-14 w-full items-center justify-center bg-white px-2 dark:bg-[#0f0f0f] min-[657px]:px-4">
        <div className="mr-auto flex h-full items-center">
          {router.asPath.split("/")[1] !== "watch" ? (
            <>
              <button
                onClick={() => setSideMenuOpen(true)}
                className="mr-1 flex cursor-pointer items-center rounded-full p-2 outline-none hover:bg-stone-200 focus:bg-stone-200 dark:hover:bg-white/10 dark:focus:bg-white/10 min-[1313px]:hidden"
              >
                <MenuIcon />
              </button>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  setSideMenuCompact((value) => !value);
                }}
                className="mr-1 hidden cursor-pointer items-center rounded-full p-2 outline-none hover:bg-stone-200 focus:bg-stone-200 dark:hover:bg-white/10 dark:focus:bg-white/10 min-[1313px]:flex"
              >
                <MenuIcon />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSideMenuOpen(true)}
              className="mr-1 flex cursor-pointer items-center rounded-full p-2 outline-none hover:bg-stone-200 focus:bg-stone-200 dark:hover:bg-white/10 dark:focus:bg-white/10"
            >
              <MenuIcon />
            </button>
          )}
          <NTLogo countryCode="IT" />
        </div>
        <div className="mx-20 hidden h-full max-w-2xl grow py-2 min-[781px]:flex">
          <input
            type="text"
            className="h-full w-full rounded-l-full border-[1px] border-stone-300 px-4 dark:border-white/[.1882] dark:bg-[#0f0f0f] dark:text-white/90 dark:placeholder:text-text-secondary-dark"
            placeholder="Search"
          />
          <button className="flex w-[4.5rem] items-center justify-center rounded-r-full border-y-[1px] border-r-[1px] border-stone-300 bg-stone-100 hover:bg-stone-200 dark:border-white/[.1882] dark:bg-white/[.08] dark:hover:bg-white/[.08]">
            <SearchIcon />
          </button>
        </div>
        <button
          className="ml-auto mr-2 rounded-full p-2 focus:bg-stone-200 dark:focus:bg-white/10 min-[781px]:hidden"
          title="Search"
        >
          <SearchIcon />
        </button>
        {!user && (
          <div ref={settingsMenuRef} className="relative min-[781px]:ml-auto">
            <button
              className="rounded-full p-2 focus:bg-stone-200 dark:focus:bg-white/10"
              title="Settings"
              onClick={(e) => {
                e.currentTarget.blur();
                setSettingsMenuOpen((value) => !value);
              }}
            >
              <KebabIcon />
            </button>
            {settingsMenuOpen && (
              <div className="absolute right-0 top-0 z-50 mt-10 max-[440px]:fixed max-[440px]:mt-12">
                <SettingsMenu />
              </div>
            )}
          </div>
        )}
        {!user && <LoginBtn />}
        {user && (
          <button
            className="mr-2 rounded-full p-2 hover:bg-stone-200 dark:hover:bg-white/10 min-[781px]:ml-auto"
            title="Create"
            onClick={() => void router.push("/studio#upload")}
          >
            <AddVideoIcon />
          </button>
        )}
        {user && (
          <div ref={settingsMenuRef} className="relative flex items-center">
            <button
              onClick={(e) => {
                e.currentTarget.blur();
                setSettingsMenuOpen((value) => !value);
              }}
              className="group h-[34px] w-[60px] cursor-default px-1.5 py-[1px] outline-none"
            >
              <div
                style={{ outlineStyle: "solid" }}
                className="relative mx-auto h-full w-8 cursor-pointer overflow-hidden rounded-full bg-red-600 outline-[0px] outline-yt-blue group-focus:outline-[1px] dark:outline-yt-blue-dark"
              >
                {channel?.hasLogo && (
                  <Image
                    fill
                    alt="channel's logo"
                    src={`${
                      process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
                    }/storage/v1/object/public/pictures/${channel.id}/logo`}
                  />
                )}
              </div>
            </button>
            {settingsMenuOpen && (
              <div className="absolute right-0 top-0 z-50 mt-10 max-[440px]:fixed max-[440px]:mt-12">
                <SettingsMenu />
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
