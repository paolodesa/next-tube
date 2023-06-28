import { useAtom } from "jotai";
import { sideMenuCompactAtom } from "~/utils/atoms";
import { SideMenuBtn } from "./SideMenuBtn";
import { useRouter } from "next/router";

export const SideMenu = () => {
  const [sideMenuCompact] = useAtom(sideMenuCompactAtom);
  const router = useRouter();

  return !sideMenuCompact ? (
    <div className="fixed -mt-14 hidden w-56 flex-col px-3 pb-2 pt-16 min-[1313px]:flex">
      <SideMenuBtn selected={router.asPath === "/"} type="HOME"></SideMenuBtn>
      <SideMenuBtn
        selected={router.asPath === "/shorts"}
        type="SHORTS"
      ></SideMenuBtn>
      <SideMenuBtn
        selected={router.asPath === "/feed/subscriptions"}
        type="SUBSCRIPTIONS"
      ></SideMenuBtn>
    </div>
  ) : (
    <></>
  );
};
