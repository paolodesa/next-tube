import { useState, type PropsWithChildren } from "react";
import { PrivacyIcon } from "~/icons/Privacy";
import { MoonIcon } from "~/icons/Moon";
import { LanguageIcon } from "~/icons/Language";
import { ShieldInfoIcon } from "~/icons/ShieldInfo";
import { WorldIcon } from "~/icons/World";
import { KeyboardIcon } from "~/icons/Keyboard";
import { HelpIcon } from "~/icons/Help";
import { FeedbackIcon } from "~/icons/Feedback";
import { SettingsIcon } from "~/icons/Settings";
import { ArrowRightIcon } from "~/icons/ArrowRight";
import { ArrowLeftIcon } from "~/icons/ArrowLeft";
import { TickIcon } from "~/icons/Tick";
import { useDarkModeContext } from "~/utils/themeHelpers";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { api } from "~/utils/api";
import { ChannelIcon } from "~/icons/Channel";
import { SignOutIcon } from "~/icons/SignOut";
import { useAtom } from "jotai";
import { settingsMenuOpenAtom } from "~/utils/atoms";
import { useRouter } from "next/router";
import { StudioIcon } from "~/icons/Studio";
import Image from "next/image";

const SettingsMenuBtn = (
  props: PropsWithChildren & { onClick?: () => void }
) => {
  return (
    <button
      onClick={props.onClick}
      className="flex w-full items-center gap-4 px-4 py-2 hover:bg-stone-100 dark:hover:bg-white/10"
    >
      {props.children}
    </button>
  );
};

const UserSection = () => {
  const { data: channel, isLoading: channelLoading } =
    api.channel.getByCurrentUser.useQuery();
  const supabaseClient = useSupabaseClient();
  const [, setSettingsMenuOpen] = useAtom(settingsMenuOpenAtom);
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
      setSettingsMenuOpen(false);
      await router.push("/");
    }
  };

  if (channelLoading) return <div>Loading...</div>;

  if (!channel) return <div>Something went wrong</div>;

  return (
    <>
      <div className="flex gap-4 px-4 py-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-red-600">
          {channel.hasLogo && (
            <Image
              fill
              alt="channel's logo"
              src={`${
                process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
              }/storage/v1/object/public/pictures/${channel.id}/logo`}
            />
          )}
        </div>
        <div className="flex grow flex-col text-base font-normal">
          <span className="">{channel.name}</span>
          <span className="">@{channel.handle}</span>
        </div>
      </div>
      <div className="my-2 w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
      <SettingsMenuBtn
        onClick={() => {
          void router.push(`/@${channel.handle}`);
          setSettingsMenuOpen(false);
        }}
      >
        <ChannelIcon />
        Your channel
      </SettingsMenuBtn>
      <SettingsMenuBtn
        onClick={() => {
          void router.push(`/studio`);
          setSettingsMenuOpen(false);
        }}
      >
        <StudioIcon />
        NextTube Studio
      </SettingsMenuBtn>
      <SettingsMenuBtn onClick={() => void handleLogout()}>
        <SignOutIcon />
        Sign out
      </SettingsMenuBtn>
      <div className="my-2 w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
    </>
  );
};

type section = "NONE" | "APPEARANCE";
export const SettingsMenu = () => {
  const [section, setSection] = useState<section>("NONE");
  const { theme, setThemeHandler: setTheme } = useDarkModeContext();
  const user = useUser();

  return (
    <div className="flex w-80 flex-col rounded-xl bg-white py-2 text-sm font-light shadow-md dark:bg-[#282828]">
      {section === "NONE" && (
        <>
          {user && <UserSection />}
          <SettingsMenuBtn>
            <PrivacyIcon />
            Your data in NextTube
          </SettingsMenuBtn>
          <div className="my-2 w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
          <SettingsMenuBtn onClick={() => setSection("APPEARANCE")}>
            <MoonIcon />
            Appearance: {theme === "system" && "Device theme"}
            {theme === "dark" && "Dark"} {theme === "light" && "Light"}
            <ArrowRightIcon className="ml-auto" />
          </SettingsMenuBtn>
          <SettingsMenuBtn>
            <LanguageIcon />
            Language: English
            <ArrowRightIcon className="ml-auto" />
          </SettingsMenuBtn>
          <SettingsMenuBtn>
            <ShieldInfoIcon />
            Restricted Mode: Off
            <ArrowRightIcon className="ml-auto" />
          </SettingsMenuBtn>
          <SettingsMenuBtn>
            <WorldIcon />
            Location: Italy
            <ArrowRightIcon className="ml-auto" />
          </SettingsMenuBtn>
          <SettingsMenuBtn>
            <KeyboardIcon />
            Keyboard shortcuts
          </SettingsMenuBtn>
          <div className="my-2 w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
          <SettingsMenuBtn>
            <SettingsIcon />
            Settings
          </SettingsMenuBtn>
          <div className="my-2 w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
          <SettingsMenuBtn>
            <HelpIcon />
            Help
          </SettingsMenuBtn>
          <SettingsMenuBtn>
            <FeedbackIcon />
            Send feedback
          </SettingsMenuBtn>
        </>
      )}
      {section === "APPEARANCE" && (
        <>
          <div className="mb-2 flex w-full items-center gap-1 px-2">
            <button
              onClick={() => setSection("NONE")}
              className="rounded-full p-2 hover:bg-stone-100 dark:hover:bg-white/10"
            >
              <ArrowLeftIcon />
            </button>
            <span className="text-base font-normal">Appearance</span>
          </div>
          <div className="w-full border-t-[1px] border-stone-200 dark:border-stone-600"></div>
          <span className="px-4 pb-3 pt-6 text-xs font-normal text-text-secondary dark:text-text-secondary-dark">
            Setting applies to this browser only
          </span>
          <SettingsMenuBtn onClick={() => setTheme("system")}>
            {theme === "system" ? (
              <TickIcon className="h-6 dark:fill-white" white={false} />
            ) : (
              <div className="h-6 w-6" />
            )}
            <span className="text-sm font-light">Use device theme</span>
          </SettingsMenuBtn>
          <SettingsMenuBtn onClick={() => setTheme("dark")}>
            {theme === "dark" ? (
              <TickIcon className="h-6 dark:fill-white" white={false} />
            ) : (
              <div className="h-6 w-6" />
            )}
            <span className="text-sm font-light">Dark theme</span>
          </SettingsMenuBtn>
          <SettingsMenuBtn onClick={() => setTheme("light")}>
            {theme === "light" ? (
              <TickIcon className="h-6 dark:fill-white" white={false} />
            ) : (
              <div className="h-6 w-6" />
            )}
            <span className="text-sm font-light">Light theme</span>
          </SettingsMenuBtn>
        </>
      )}
    </div>
  );
};
