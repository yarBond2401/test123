"use client";

import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription, CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";

import { PublicProfile, publicProfileSchema } from "./schema";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageInput from "@/components/ImageInput";

import { updateProfile } from "firebase/auth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import StripeAccountCard from "./components/StripeAccountCard";

const Profile = () => {
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const [stripeAccountStatus, setStripeAccountStatus] = useState("not_created")

  const form = useForm<PublicProfile>({
    resolver: zodResolver(publicProfileSchema),
    mode: "all",
    defaultValues: {
      email: "",
      photoURL: "",
      displayName: "",
    },
  });

  const onSubmit = async (data: PublicProfile) => {
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      form.setValue("email", user.email || "");
      form.setValue("displayName", user.displayName || "");
      form.setValue("photoURL", user.photoURL || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader className="max-w-xl">
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
          <Separator />
        </CardHeader>
        <CardContent className="flex flex-col max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        type="text"
                        {...field}
                        className="hidden"
                      />
                    </FormControl>
                    {user?.uid && (
                      <ImageInput
                        storagePath="users/"
                        value={field.value}
                        onChange={(url) => field.onChange(url)}
                        imageName={user.uid}
                      />
                    )}
                    <FormDescription>
                      Upload a profile picture to be recognized
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="user@example.com"
                        readOnly
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      {"Your email address can't be changed"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      How others will see you on the site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={!form.formState.isValid}
                className="mt-4 w-full"
              >
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <StripeAccountCard />
    </div>
  );
};


export default Profile;
