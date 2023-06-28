import { MenuIcon } from "~/icons/Menu";
import { SideMenuBtn } from "./SideMenuBtn";
import { NTLogo } from "./NTLogo";

import { sideMenuOpenAtom } from "~/utils/atoms";
import { useAtom } from "jotai";
import useOnClickOutside from "~/utils/outsideClickHook";
import { useRef } from "react";
import { useRouter } from "next/router";

export const SideDrawer = () => {
  const [sideMenuOpen, setSideMenuOpen] = useAtom(sideMenuOpenAtom);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(sideMenuRef, () => setSideMenuOpen(false));

  return (
    <div
      className={`${
        sideMenuOpen ? "visible" : "invisible"
      } fixed z-50 h-full w-full transition-[visibility] duration-200 ${router.asPath.split("/")[1] !== "watch" ? "min-[1313px]:duration-0" : ""}`}
    >
      <div
        className={`${
          sideMenuOpen ? "opacity-100" : "opacity-0"
        } absolute z-0 h-full w-full bg-black/50 transition-opacity duration-200`}
      ></div>
      <div
        ref={sideMenuRef}
        className={`${
          sideMenuOpen ? "translate-y-0" : "-translate-x-60"
        } absolute h-full w-60 flex-col overflow-y-auto overflow-x-hidden bg-white transition-transform duration-200 dark:bg-[#0f0f0f]`}
      >
        <div className="flex h-14 items-center px-2 min-[657px]:px-4">
          <button
            onClick={() => setSideMenuOpen(false)}
            className="mr-1 flex h-min cursor-pointer items-center rounded-full p-2 outline-none hover:bg-stone-200 focus:bg-stone-200 dark:hover:bg-white/10 dark:focus:bg-white/10"
          >
            <MenuIcon />
          </button>
          <NTLogo countryCode="IT" />
        </div>
        <div className="mt-3 w-full flex-col pb-2 pl-3 pr-6 xl:flex">
          <SideMenuBtn onClick={() => setSideMenuOpen(false)} selected={router.asPath === "/"} type="HOME"></SideMenuBtn>
          <SideMenuBtn onClick={() => setSideMenuOpen(false)} selected={router.asPath === "/shorts"} type="SHORTS"></SideMenuBtn>
          <SideMenuBtn onClick={() => setSideMenuOpen(false)} selected={router.asPath === "/feed/subscriptions"} type="SUBSCRIPTIONS"></SideMenuBtn>
        </div>
      </div>
    </div>
  );
};
