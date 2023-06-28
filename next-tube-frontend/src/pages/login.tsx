import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { Spinner } from "~/components/Spinner";
import type { AuthError } from "@supabase/gotrue-js";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof loginFormSchema>;

const LoginPage: NextPage = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginFormSchema) });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<AuthError>();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (!error) {
      await router.push(`/${router.query.redirectTo as string ?? ""}`);
    } else {
      setLoginError(error);
    }

    setLoading(false);
  });

  return (
    <>
      <Head>
        <title>{`Login - NextTube`}</title>
      </Head>
      <main className="block">
        <form
          noValidate
          className="mx-auto mt-16 flex min-h-[calc(100vh-8rem)] w-full max-w-[332px] flex-col items-center justify-center gap-4 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <span className="text-center text-2xl font-bold">
            Welcome to NextTube
          </span>
          <span className="-mt-2 mb-4 text-center text-sm font-light">
            SIGN IN
          </span>
          <div
            className={`${
              errors.email
                ? "border-[#ff4e45]"
                : "border-stone-300 focus-within:border-yt-blue dark:border-stone-600 dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.email && (
              <div className="form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 text-white group-focus-within:flex">
                <span className="text-xs font-normal">
                  {errors.email.message}
                </span>
              </div>
            )}
            <input
              {...register("email")}
              placeholder="E-Mail"
              type="email"
              className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
            ></input>
          </div>
          <div
            className={`${
              errors.password
                ? "border-[#ff4e45]"
                : "border-stone-300 focus-within:border-yt-blue dark:border-stone-600 dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.password && (
              <div className="form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 text-white group-focus-within:flex">
                <span className="text-xs font-normal">
                  {errors.password.message}
                </span>
              </div>
            )}
            <input
              {...register("password")}
              placeholder="Password"
              type="password"
              className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
            ></input>
          </div>
          <Link
            href={"/reset-password"}
            className="ml-auto text-xs text-black/70 hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            {"Forgotten your password?"}
          </Link>
          <div className="ml-auto mt-2 flex gap-2">
            {!loading && (
              <Link
                href={{
                  pathname: "/signup",
                  query: router.query.redirectTo
                    ? { redirectTo: router.query.redirectTo }
                    : "",
                }}
                className={`h-min rounded-md border-2 border-transparent px-3.5 py-2 text-sm font-medium text-black/70 hover:text-black dark:text-white/80 dark:hover:text-white`}
              >
                SIGN UP
              </Link>
            )}
            {!loading && (
              <button
                type="submit"
                className={`h-min rounded-md border-2 border-yt-blue-dark px-3.5 py-2 text-sm font-medium text-black/70 hover:bg-yt-blue-dark hover:text-black dark:text-white/80 dark:hover:text-white`}
              >
                LOGIN
              </button>
            )}
            {loading && <Spinner className="h-10 w-20 px-6 py-1" />}
          </div>
          {!loading && loginError && (
            <span className="ml-auto text-xs text-[#ff4e45]">
              Invalid credentials, please try again
            </span>
          )}
        </form>
      </main>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(ctx.query);

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return { props: {} };
};

export default LoginPage;
