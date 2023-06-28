import { useAtom } from "jotai";
import { SideMenuBtnSm } from "./SideMenuBtnSm";
import { sideMenuCompactAtom } from "~/utils/atoms";
import { useRouter } from "next/router";

export const SideMenuSm = () => {
  const [sideMenuCompact] = useAtom(sideMenuCompactAtom);
  const router = useRouter();

  return sideMenuCompact ? (
    <div
      className={
        "fixed -mt-14 hidden w-[4.5rem] flex-col pt-[3.5rem] min-[792px]:flex"
      }
    >
      <SideMenuBtnSm selected={router.asPath === "/"} type="HOME"></SideMenuBtnSm>
      <SideMenuBtnSm selected={router.asPath === "/shorts"} type="SHORTS"></SideMenuBtnSm>
      <SideMenuBtnSm
        selected={router.asPath === "/feed/subscriptions"}
        type="SUBSCRIPTIONS"
      ></SideMenuBtnSm>
    </div>
  ) : (
    <></>
  );
};