"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { Inputs } from "./types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "@/app/firebase";
import { useRouter } from "next/navigation";

import image from "@/images/luxury-home-2409518_1280.jpg";
import sideImage from "@/images/signin-banner.png";
import logo from "@/images/logo.png";
import Link from "next/link";

const Login = () => {
  const { register, handleSubmit } = useForm<Inputs>();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  auth.onAuthStateChanged((user) => {
    if (user) {
      router.push("/dashboard");
    }
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {})
      .catch((error) => {
        setError(error.code);
      });
  };

  return (
    <>
      <figure className="hidden 2xl:block col-span-3 h-full">
        <Image
          src={sideImage}
          alt="US House"
          className="h-full object-cover object-left-top"
          priority={true}
        />
      </figure>
      <section className="col-span-5 2xl:col-span-2 flex flex-col self-center justify-self-center items-center justify-center max-w-lg mx-4">
        <Image src={logo} alt="US House" width={170} className="mb-8" />
        <h1 className="font-akira text-3xl mb-8 text-center">Welcome back</h1>
        <div className="relative w-full mb-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-s">
            <span className="px-2 bg-[var(--secondary-color)]">
              Login using email
            </span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-stretch gap-1 w-full"
        >
          <label htmlFor="email" className="self-start">
            Email
          </label>
          <Input {...register("email")} type="email" />
          <label htmlFor="password" className="self-start">
            Password
          </label>
          <Input {...register("password")} type="password" />

          <Link href="/auth/reset-password" className="self-end underline text-sm">
            Forgot your password?
          </Link>
          {error && (
            <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div>
              {/* <span className="font-medium">Danger alert!</span> Change a few things up and try submitting again. */}
              {error}
            </div>
          </div>
          )}
          <Button type="submit" className="mt-4">
            Sign in
          </Button>
          <p className="text-sm self-center mt-4">
            Do not have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </p>
        </form>
      </section>
    </>
  );
};

export default Login;
