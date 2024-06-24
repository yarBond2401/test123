// @ts-nocheck

"use client";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaBuilding } from "react-icons/fa";
import { FaHelmetSafety } from "react-icons/fa6";
import { z } from "zod";
import { auth, db } from "@/app/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import sideImage from "@/images/signup-banner.png";
import logo from "@/images/logo.png";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema } from "./schema";
import { FormScreen, Inputs } from "./types";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from "@/components/ui/select";
import { pricingDescriptions, pricingModels, pricingNames } from "@/lib/pricing-models";
import { AnimatedNumber } from "@/components/ui/animated-numbers";
import { createCheckoutSession, checkPaymentStatus } from "@/lib/checkout";
import { usePaymentLoading } from "@/hooks/usePaymentLoading";

const WP_SITE = "https://mrkit.io";

const defaultVendorData = {
  description: "",
  generic_availability: [],
  totalRating: 0,
  totalReviews: 0,
  level: "New Seller",
  success: 100,
  response: 100,
  totalMoney: 0,
  totalMoneyInt: 0,
  totalWork: 0,
  totalWorkInt: 0,
  totalHours: 0,
  totalHoursInt: 0,
  monthlyAmount: 0,
  annualAmount: 0,
};

const defaultAgentData = {
  description: "",
  generic_availability: [],
  totalRating: 0,
  totalReviews: 0,
  response: 100,
  totalMoney: 0,
  totalMoneyInt: 0,
  totalWork: 0,
  totalWorkInt: 0,
  totalHours: 0,
  totalHoursInt: 0,
  monthlyAmount: 0,
  annualAmount: 0,
  postsInstalled: 0,
};

const showSuccessToast = () => {
  toast({
    toastType: "success",
    title: "Account created",
    description: "You can now sign in",
  });
};

const showErrorToast = (message: string) => {
  toast({
    toastType: "error",
    title: "Error",
    description: message,
  });
};

const sendWelcomeEmail = async (email: string, name: string, password: string) => {
  try {
    await addDoc(collection(db, "mail"), {
      to: [email],
      message: {
        subject: "Welcome to MRK IT",
        html: `
          <img src=${logoRef} alt="logo" style="height:100px;" />
          <p>Hello, ${name}. Thank you for registering!</p>
          <p>Your login: ${email}</p>
          <p>Your password: ${password}</p>
        `,
      },
    });
  } catch (e) {
    console.error("Error sending welcome email: ", e);
  }
};

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: undefined,
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      pricingRegion: "northwest",
      pricingModel: "silver",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [formScreen, setFormScreen] = useState<FormScreen>("user-type");
  const [region, setRegion] = useState("northwest");

  const { setPaymentLoading } = usePaymentLoading();

  const logoRef =
    "https://firebasestorage.googleapis.com/v0/b/mkr-it.appspot.com/o/public%2Flogo.png?alt=media&token=d9c0e8ab-d005-4347-b8ec-c612385ebc24";

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      setPaymentLoading(true);
      // Create user account for both agent and vendor
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("userCredential", userCredential);

      if (!userCredential) throw new Error("Failed to create user");

      console.log("userCredential.user", userCredential.user);

      await signOut(auth);

      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      const userId = userCredential.user.uid;
      console.log("data.role", data.role);
      if (data.role === "agent") {
        // For agents, save initial user data and redirect to payment
        await setDoc(doc(db, "userInfo", userId), {
          ...defaultAgentData,
          pricingRegion: data.pricingRegion,
          pricingModel: data.pricingModel,
        });

        const uniqueId = Math.random().toString(36).substring(7);
        const { url, session } = await createCheckoutSession({
          id: uniqueId,
          userId,
          email: data.email,
          region: data.pricingRegion,
          plan: data.pricingModel,
          isNewUser: true,
        });
        // await signOut(auth);
        window.location.href = url;
      } else {
        // For vendors, complete the signup process
        await setDoc(doc(db, "vendors", userId), defaultVendorData);
        await sendWelcomeEmail(data.email, data.name, data.password);
        await signOut(auth);
        setPaymentLoading(false);
        showSuccessToast();
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Error in onSubmit: ", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const checkoutSessionId = localStorage.getItem("checkoutSessionId");

    if (success && checkoutSessionId) {
      checkPaymentStatus(checkoutSessionId)
        .then(async (status) => {
          if (status === 'complete' || status === 'paid') {
            showSuccessToast();
            setPaymentLoading(false);
            router.push("/auth/signin");
          } else {
            console.error("Payment status is not complete: ", status);
            showErrorToast("Payment was not completed successfully.");
          }
        })
        .catch(() => console.error("Error checking payment status"))
        .finally(() => {
          localStorage.removeItem("checkoutSessionId");
        });
    } else if (canceled) {
      console.error("Payment was canceled");
      showErrorToast("Payment was canceled. Please try again.");
      localStorage.removeItem("checkoutSessionId");
    }
  }, [router, searchParams]);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role && ["agent", "vendor"].includes(role as string)) {
      form.setValue("role", role as Inputs["role"]);
      setFormScreen("user-details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const pricingRegion = form.watch("pricingRegion");
    if (pricingRegion) {
      setRegion(pricingRegion);
    }
  }, [form]);

  const navigateToAgentPricing = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isValid = await form.trigger(["name", "email", "password", "passwordConfirmation", "acceptTerms"]);
    if (isValid) {
      setFormScreen("agent-pricing");
    } else {
      toast({
        toastType: "error",
        title: "Validation error",
        description: "Please complete all required fields correctly.",
      });
    }
  };

  return (
    <>
      <figure className="hidden 2xl:block col-span-3 h-full order-2">
        <Image
          src={sideImage}
          alt="US House"
          className="h-full object-cover object-right-top"
          priority={true}
        />
      </figure>
      <section className="col-span-5 2xl:col-span-2 flex flex-col self-center justify-self-center items-center justify-center mx-4 order-1">
        <Image src={logo} alt="US House" width={170} className="mb-8" />
        <h1 className="font-akira text-3xl mb-8 text-center">
          Welcome to MRK IT
        </h1>
        <div className="relative w-full mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-s">
            <span className="px-2 bg-[var(--secondary-color)]">
              {formScreen === "user-details" ? (
                <>
                  Complete your{" "}
                  <span className="font-semibold">
                    {form.watch("role") === "agent" ? "agent" : "vendor"}
                  </span>{" "}
                  account
                </>
              ) : formScreen === "agent-pricing" || formScreen === "vendor-pricing" ? (
                "Select your region and pricing"
              ) : (
                "Select user type"
              )}
            </span>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col"
          >
            <fieldset
              className={formScreen === "user-type" ? "flex" : "hidden"}
            >
              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => form.setValue("role", value as Inputs["role"])}
                      className="flex flex-col gap-6 md:flex-row w-full"
                    >
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="agent" className="sr-only" />
                          </FormControl>
                          <Card className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-ptertiary peer-checked:text-ptertiary hover:text-gray-600 hover:bg-secondary dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                            <div className="block">
                              <div className="w-full text-lg font-semibold">
                                {"I'm an agent"}
                              </div>
                              <div className="w-full text-balance weight fornt-normal">
                                Join as a realtor or a broker
                              </div>
                            </div>
                            <FaBuilding className="w-10 h-10" />
                          </Card>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem
                              value="vendor"
                              className="sr-only"
                            ></RadioGroupItem>
                          </FormControl>
                          <Card className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-ptertiary peer-checked:text-ptertiary hover:text-gray-600 hover:bg-secondary dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                            <div className="block">
                              <div className="w-full text-lg font-semibold">
                                {"I'm a vendor"}
                              </div>
                              <div className="w-full text-balance weight fornt-normal">
                                Join as a realtor service provider
                              </div>
                            </div>
                            <FaHelmetSafety className="w-10 h-10" />
                          </Card>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </fieldset>
            <fieldset
              className={cn(
                formScreen === "user-details" ? "flex" : "hidden",
                "flex-col items-stretch gap-1 w-full"
              )}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
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
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Confirmation</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flew-row space-y-0 items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="">
                      <FormLabel className="">
                        I have read and agree the{" "}
                        <Link
                          href={`${WP_SITE}/terms-and-conditions/`}
                          className="underline"
                        >
                          terms and conditions
                        </Link>
                        , the{" "}
                        <Link
                          href={`${WP_SITE}/privacy-policy/`}
                          className="underline"
                        >
                          privacy policy
                        </Link>
                        , and the{" "}
                        <Link
                          href={`${WP_SITE}/refund-policy/`}
                          className="underline"
                        >
                          refund policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </fieldset>

            {formScreen === "agent-pricing" && form.watch("role") === "agent" && (
              <fieldset className="flex flex-col items-stretch gap-2 w-full">
                <div className="flex justify-center pb-6">
                  <FormField
                    control={form.control}
                    name="pricingRegion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-baseline gap-2">
                        <FormLabel className="text-md font-medium">Region</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setRegion(value);
                            }}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue placeholder="Select a region" />
                            </SelectTrigger>
                            <SelectContent className="">
                              {Object.keys(pricingModels).map((key) => (
                                <SelectItem
                                  key={key}
                                  value={key}
                                  className="cursor-pointer"
                                >
                                  {pricingModels[key].regionName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="pricingModel"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => form.setValue("pricingModel", value)}
                        className="flex flex-col gap-6 sm:flex-row w-full"
                      >
                        {Object.keys(pricingNames).map((key) => (
                          <FormItem key={key}>
                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                              <FormControl>
                                <RadioGroupItem value={key} className="sr-only" />
                              </FormControl>
                              <Card className={cn("p-2 transition-colors duration-300 lg:min-w-[200px] lg:max-w-[300px] md:min-w-[250px] md:max-w-[250px] sm:min-w-[200px] sm:max-w-[200px]", field.value !== key ? "bg-secondary" : "")}>
                                <CardHeader className="text-center pb-2">
                                  {key == "silver" &&
                                    <Badge className="uppercase w-max self-center mb-3">
                                      Most popular
                                    </Badge>
                                  }
                                  <CardTitle className="mb-7">{pricingNames[key]} Plan</CardTitle>
                                  <span className="font-bold text-5xl">
                                    $<AnimatedNumber value={pricingModels[region][key].price} />
                                  </span>
                                </CardHeader>
                                <CardDescription className="text-center">
                                  {pricingDescriptions[key]}
                                </CardDescription>
                                <CardContent>
                                  <ul className="mt-7 space-y-2.5 text-sm">
                                    <li className="flex space-x-2">
                                      <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                      <span className="text-muted-foreground">
                                        $<AnimatedNumber value={pricingModels[region][key].postPrice} /> per post
                                      </span>
                                    </li>
                                    <li className="flex space-x-2">
                                      <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                      <span className="text-muted-foreground">{pricingModels[region][key].maxPosts} posts in plan</span>
                                    </li>
                                  </ul>
                                </CardContent>
                                <CardFooter>
                                  <Button
                                    variant="outline"
                                    type="button"
                                    className={cn("w-full transition-all duration-300", field.value !== key ? "bg-primary text-white" : "bg-white text-primary border border-primary")}
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      form.setValue("pricingModel", key);
                                    }}
                                  >
                                    {field.value !== key ? "Select" : "Selected"}
                                  </Button>
                                </CardFooter>
                              </Card>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />

              </fieldset>
            )}

            {error && (formScreen === "user-details" || formScreen === "agent-pricing") && (
              <div
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
            )}
            <div className="flex max-w-full flex-col justify-center align-items-center gap-4 mt-4">
              {formScreen === "user-type" ? (
                <Button
                  className="mt-4 flex-1"
                  disabled={form.watch("role") === undefined}
                  onClick={() => setFormScreen("user-details")}
                  type="button"
                >
                  Continue
                </Button>
              ) : formScreen === "user-details" && form.watch("role") === "agent" ? (
                <div className="flex w-full flex-row gap-4 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    type="button"
                    onClick={() => setFormScreen("user-type")}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={navigateToAgentPricing}
                    type="button"
                  >
                    Continue
                  </Button>
                </div>
              ) : formScreen === "agent-pricing" ? (
                <div className="flex w-full flex-row gap-4 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    type="button"
                    onClick={() => setFormScreen("user-details")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    Sign up and pay
                  </Button>
                </div>
              ) : (
                <div className="flex w-full flex-row gap-4 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    type="button"
                    onClick={() => setFormScreen("user-type")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm self-center mt-4">
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </section>
    </>
  );
};

export default Signup;