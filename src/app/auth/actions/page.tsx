"use client";

import { confirmPasswordReset, validatePassword, verifyPasswordResetCode, AuthError } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { auth } from '@/app/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ResetPassword, resetPasswordSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';

type Mode = "resetPassword" | "verifyEmail" | null;

const ActionsPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: ""
    }
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    setMode(searchParams.get("mode") as Mode);
    setCode(searchParams.get("oobCode"));
  }, [searchParams])


  const handleResetPassword = async (data: ResetPassword) => {
    if (!code) return;
    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, code)
        .then(email => {
          confirmPasswordReset(auth, code, data.password)
            .then(() => {
              toast({
                title: "Password reset",
                description: "Your password has been reset successfully",
              })
              router.push("/auth/signin");
            })
            .catch((error: AuthError) => {
              setError(error.message);
            })
        })
        .catch((error: AuthError) => {
          setError(error.message);
        })
    }
  }

  if (!mode) return null;

  return (
    <section className="col-span-5 flex flex-col self-center justify-self-center items-center justify-center max-w-lg mx-4 order-1">
      <h1 className="font-akira text-3xl mb-8 text-center">
        {
          mode === "resetPassword" ? "Reset password" : null
        }
      </h1>
      <Form {...form}>
        <form
          className="w-full"
          onSubmit={form.handleSubmit(handleResetPassword)}
        >
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  New password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New password"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="passwordConfirmation"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Confirm password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {
            error &&
            < div
              className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800 mt-4"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>
                {/* <span className="font-medium">Danger alert!</span> Change a few things up and try submitting again. */}
                {error}
              </div>
            </div>
          }
          <Button
            type="submit"
            className="w-full mt-4"
          >
            {
              mode === "resetPassword" ? "Reset password" : null
            }
          </Button>
        </form>
      </Form>
    </section >
  )
}


export default ActionsPage;