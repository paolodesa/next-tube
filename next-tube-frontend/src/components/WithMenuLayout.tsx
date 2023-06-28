import { type PropsWithChildren } from "react";
import { Header } from "./Header";
import { SideDrawer } from "./SideDrawer";

import { useWindowSize } from "~/utils/windowSizeHook";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  channelCarouselCards,
  sideMenuCompactAtom,
  sideMenuOpenAtom,
} from "~/utils/atoms";
import { SideMenuSm } from "~/components/SideMenuSm";
import { SideMenu } from "~/components/SideMenu";

export const WithMenuLayout = (props: PropsWithChildren) => {
  const [sideMenuCompact, setSideMenuCompact] = useAtom(sideMenuCompactAtom);
  const [sideMenuOpen, setSideMenuOpen] = useAtom(sideMenuOpenAtom);
  const [openedOnWindowExpansion, setOpenedOnWindowExpansion] = useState(false);
  const [windowWidth] = useWindowSize();
  const [, setCarouselCards] = useAtom(channelCarouselCards);

  useEffect(() => {
    if (windowWidth) {
      if (windowWidth < 1313 && !sideMenuCompact) {
        setSideMenuCompact(true);
      } else if (windowWidth >= 1313 && sideMenuOpen) {
        setSideMenuOpen(false);
      } else if (windowWidth >= 1313 && !openedOnWindowExpansion) {
        setSideMenuCompact(false);
        setOpenedOnWindowExpansion(true);
      } else if (windowWidth < 1313 && openedOnWindowExpansion) {
        setOpenedOnWindowExpansion(false);
      }
    }
    const channelContentEl =
      document.querySelector<HTMLDivElement>("#channel-content");
    const contentEl = document.querySelector<HTMLDivElement>("#main-content");
    if (channelContentEl && contentEl) {
      const carouselCards = Math.min(
        Math.floor(
          (parseInt(
            getComputedStyle(channelContentEl).width.replace("px", "")
          ) -
            20 * 2) /
            214
        ),
        6
      );
      setCarouselCards(carouselCards);
      contentEl.style.setProperty("--carousel-cards", carouselCards.toString());
    }
  }, [
    windowWidth,
    sideMenuCompact,
    setSideMenuCompact,
    sideMenuOpen,
    setSideMenuOpen,
    openedOnWindowExpansion,
    setOpenedOnWindowExpansion,
    setCarouselCards,
  ]);

  return (
    <>
      <Header />
      <SideDrawer />
      <div className="h-14"></div>
      <main
        className={`block min-[792px]:grid ${
          sideMenuCompact
            ? "grid-cols-[4.5rem_calc(100%-4.5rem)]"
            : "grid-cols-[14rem_calc(100%-14rem)]"
        } w-full`}
      >
        <SideMenu />
        <SideMenuSm />
        {sideMenuCompact && (
          <div className="hidden w-full min-[792px]:block"></div>
        )}
        {!sideMenuCompact && <div className="w-full"></div>}
        <div id="main-content">{props.children}</div>
      </main>
    </>
  );
};
