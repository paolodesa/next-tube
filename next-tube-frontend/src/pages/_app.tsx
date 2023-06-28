import type { AppProps } from "next/app";

import { api } from "~/utils/api";

import { Roboto } from "next/font/google";

import "~/styles/globals.css";
import Head from "next/head";
import {
  type Session,
  createBrowserSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { DarkModeContextProvider } from "~/utils/themeHelpers";
import { useAtom } from "jotai";
import { sideMenuOpenAtom, uploadModalOpenAtom } from "~/utils/atoms";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) => {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const [sideMenuOpen] = useAtom(sideMenuOpenAtom);
  const [uploadModalOpen] = useAtom(uploadModalOpenAtom);

  useEffect(() => {
    if (sideMenuOpen || uploadModalOpen) {
      document.body.style.setProperty("overflow-y", "hidden");
    } else {
      document.body.style.setProperty("overflow-y", "auto");
    }
  }, [sideMenuOpen, uploadModalOpen]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Head>
        <title>NextTube</title>
        <meta name="description" content="NextTube clone made with NextJS" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          html {
            font-family: ${roboto.style.fontFamily};
          }
        `}</style>
      </Head>
      <DarkModeContextProvider>
        <Component {...pageProps} />
      </DarkModeContextProvider>
    </SessionContextProvider>
  );
};

export default api.withTRPC(MyApp);
