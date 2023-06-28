import Link from "next/link";
import { HomeIcon } from "~/icons/Home";
import { ShortsIcon } from "~/icons/Shorts";
import { SubscriptionsIcon } from "~/icons/Subscriptions";

export const SideMenuBtn = (props: {
  selected: boolean;
  type: "HOME" | "SHORTS" | "SUBSCRIPTIONS";
  onClick?: () => void;
}) => {
  let btnPath: string;
  switch (props.type) {
    case "HOME":
      btnPath = "/"
      break
    case "SHORTS":
      btnPath = "/"
      break
    case "SUBSCRIPTIONS":
      btnPath = "/feed/subscriptions"
      break
  }

  return (
    <Link
      href={btnPath}
      onClick={props.onClick}
      className={`flex h-10 w-full items-center gap-5 rounded-xl ${
        props.selected
          ? "bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20"
          : "hover:bg-stone-100 dark:hover:bg-white/10"
      } px-2.5`}
    >
      {props.type === "HOME" && <HomeIcon filled={props.selected} />}
      {props.type === "SHORTS" && <ShortsIcon filled={props.selected} />}
      {props.type === "SUBSCRIPTIONS" && (
        <SubscriptionsIcon filled={props.selected} />
      )}
      <span className={`text-sm ${props.selected ? "font-medium" : ""}`}>
        {props.type.charAt(0) + props.type.slice(1).toLowerCase()}
      </span>
    </Link>
  );
};