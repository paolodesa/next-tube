import Link from "next/link";
import type { PropsWithChildren } from "react";

export const ChannelTabsBtn = (
  props: PropsWithChildren & { selected: boolean; href: string }
) => {
  return (
    <Link
      className={`${
        props.selected
          ? "border-b-[3px]"
          : "text-text-secondary dark:text-text-secondary-dark"
      } hover:text-balck flex h-12 items-center border-stone-600 px-8 text-sm font-medium hover:text-black dark:border-stone-400 dark:hover:text-[#f1f1f1]`}
      href={props.href}
    >
      {props.children}
    </Link>
  );
};
