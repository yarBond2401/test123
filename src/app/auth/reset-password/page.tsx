"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/app/firebase";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { sendPasswordResetEmail } from "firebase/auth";
import { resetPasswordSchema, Inputs } from "./schema";

import logo from "@/images/logo.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

const ResetPassword = () => {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Inputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: Inputs) => {
    await sendPasswordResetEmail(auth, data.email)
      .then(_ => {
        setError(null)
        toast({
          title: "Email sent",
          description: "If the email is registered, you will receive a password reset link.",
        })
      })
      .catch((error) => {
        console.error(error)
        setError(error.message)
      })
  }

  return (
    <div className="flex flex-row col-span-5 justify-center items-center">
      <section className="col-span-5 2xl:col-span-2 flex flex-col self-center justify-self-center items-center justify-center max-w-lg mx-4">
        <Image src={logo} alt="US House" width={170} className="mb-8" />
        <h1 className="font-akira text-3xl mb-4 text-center">
          Reset password
        </h1>
        <div className="relative w-full mb-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-s">
            <span className="px-2 bg-[var(--secondary-color)]">
              Recover your password
            </span>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-stretch gap-1 w-full"
        >
          <label htmlFor="email" className="self-start">
            Registered email
          </label>
          <Input {...register("email")} type="email" className="mb-2" />
          {/* <label htmlFor="password" className="self-start">
            Password
          </label>
          <Input {...register("password")} type="password" />

          <Link href="/auth/reset-password" className="self-end underlisne text-sm">
            Forgot your password?
          </Link> */}
          {error && (
            <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
              <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Error</span>
              <div>
                {error}
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="mt-2"
            disabled={formState.isSubmitting}
          >
            Send reset link
          </Button>
          <p className="text-sm self-center mt-4">
            Do not need to recover?{" "}
            <Link href="/auth/signin" className="underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default ResetPassword;