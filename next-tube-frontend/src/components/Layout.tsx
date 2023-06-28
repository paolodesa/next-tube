import { type PropsWithChildren } from "react";
import { Header } from "./Header";
import { SideDrawer } from "./SideDrawer";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <Header />
      <SideDrawer />
      <div className="h-14"></div>
      <main className="w-full">
        <div id="main-content">{props.children}</div>
      </main>
    </>
  );
};
