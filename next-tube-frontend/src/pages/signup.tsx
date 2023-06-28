import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner } from "~/components/Spinner";
import { useState } from "react";
import type { AuthError } from "@supabase/gotrue-js";
import { api } from "~/utils/api";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

const signupFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
    name: z.string().min(1),
    handle: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof signupFormSchema>;

const SignupPage: NextPage = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(signupFormSchema) });
  const handle = useWatch({
    control,
    name: "handle",
  });
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<AuthError>();
  const { data: handleAvail, refetch } = api.channel.checkHandleAvail.useQuery(
    { channelHandle: handle },
    { enabled: false }
  );

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setSignupError(undefined);

    const res = await refetch();
    if (res.data) {
      const { error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            handle: data.handle,
          },
        },
      });
      if (!error) {
        await router.push(`/${router.query.redirectTo as string ?? ""}`);
      } else {
        setSignupError(error);
      }
    } else {
      setFocus("handle");
    }

    setLoading(false);
  });

  return (
    <>
      <Head>
        <title>{`SignUp - NextTube`}</title>
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
            SIGN UP
          </span>
          <div
            className={`${
              errors.email
                ? "border-[#ff4e45]"
                : "border-stone-300 dark:border-stone-600 focus-within:border-yt-blue dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.email && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
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
                : "border-stone-300 dark:border-stone-600 focus-within:border-yt-blue dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.password && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
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
          <div
            className={`${
              errors.confirmPassword
                ? "border-[#ff4e45]"
                : "border-stone-300 dark:border-stone-600 focus-within:border-yt-blue dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.confirmPassword && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
                <span className="text-xs font-normal">
                  {errors.confirmPassword.message}
                </span>
              </div>
            )}
            <input
              {...register("confirmPassword")}
              placeholder="Confirm password"
              type="password"
              className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
            ></input>
          </div>
          <div
            className={`${
              errors.name
                ? "border-[#ff4e45]"
                : "border-stone-300 dark:border-stone-600 focus-within:border-yt-blue dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.name && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
                <span className="text-xs font-normal">
                  {errors.name.message}
                </span>
              </div>
            )}
            <input
              {...register("name")}
              placeholder="Name"
              className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
            ></input>
          </div>
          <div
            className={`${
              errors.handle || handleAvail === false
                ? "border-[#ff4e45]"
                : "border-stone-300 dark:border-stone-600 focus-within:border-yt-blue dark:focus-within:border-yt-blue-dark"
            } group relative flex h-min w-full flex-col rounded-md border-[1px] px-3 pb-2 pt-2 font-light`}
          >
            {errors.handle && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
                <span className="text-xs font-normal">
                  {errors.handle.message}
                </span>
              </div>
            )}
            {handleAvail === false && !errors.handle && (
              <div className="text-white form-tooltip absolute -top-2 left-0 hidden -translate-y-full items-center rounded-[4px] bg-[#606060]/90 px-3 py-2 group-focus-within:flex">
                <span className="text-xs font-normal">
                  {"This username is not available"}
                </span>
              </div>
            )}
            <input
              {...register("handle")}
              placeholder="Username"
              className={`my-1 h-[22.5px] resize-none bg-transparent text-[15px] outline-none placeholder:font-normal placeholder:text-[#717171]`}
            ></input>
          </div>
          <div className="ml-auto mt-2 flex items-center gap-2">
            {!loading && (
              <button
                type="submit"
                className={`h-min rounded-md border-2 border-yt-blue-dark px-3.5 py-2 text-sm font-medium text-black/70 hover:bg-yt-blue-dark hover:text-black dark:text-white/80 dark:hover:text-white`}
              >
                SIGN UP
              </button>
            )}
            {loading && <Spinner className="h-10 w-20 px-6 py-1" />}
          </div>
          {!loading && signupError && (
            <span className="ml-auto text-xs text-[#ff4e45]">
              {signupError.message === "User already registered"
                ? "This email is already associated with a user"
                : "An error occurred durign signup, please try again"}
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

  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return { props: {} };
};

export default SignupPage;
