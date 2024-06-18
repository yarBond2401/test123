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

const WP_SITE = "https://mrkit.io";

const defaultVendorData = {
  description: "",
  generic_availability: [],
  totalRating: 0,
  totalReviews: 0,
  level: "New Seller",
  responce: 0,
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
  level: "New Agent",
  responce: 100,
  totalMoney: 0,
  totalMoneyInt: 0,
  totalWork: 0,
  totalWorkInt: 0,
  totalHours: 0,
  totalHoursInt: 0,
  monthlyAmount: 0,
  annualAmount: 0,
};

const pricingNames = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const pricingModels = {
  northwest: {
    regionName: "Northwest",
    bronze: { price: 350, postPrice: 70, maxPosts: 5 },
    silver: { price: 510, postPrice: 51, maxPosts: 10 },
    gold: { price: 600, postPrice: 40, maxPosts: 15 },
  },
  northcalifornia: {
    regionName: "North California",
    bronze: { price: 400, postPrice: 80, maxPosts: 5 },
    silver: { price: 560, postPrice: 56, maxPosts: 10 },
    gold: { price: 660, postPrice: 44, maxPosts: 15 },
  },
  southcalifornia: {
    regionName: "South California",
    bronze: { price: 450, postPrice: 90, maxPosts: 5 },
    silver: { price: 610, postPrice: 61, maxPosts: 10 },
    gold: { price: 720, postPrice: 48, maxPosts: 15 },
  },
  westcentral: {
    regionName: "West Central",
    bronze: { price: 500, postPrice: 100, maxPosts: 5 },
    silver: { price: 660, postPrice: 66, maxPosts: 10 },
    gold: { price: 780, postPrice: 52, maxPosts: 15 },
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
      region: "northwest",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [formScreen, setFormScreen] = useState<FormScreen>("user-type");
  const [region, setRegion] = useState("northwest");

  const logoRef =
    "https://firebasestorage.googleapis.com/v0/b/mkr-it.appspot.com/o/public%2Flogo.png?alt=media&token=d9c0e8ab-d005-4347-b8ec-c612385ebc24";

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    ).catch((error) => {
      setError(error.code);
    });

    if (!userCredential) return;

    await updateProfile(userCredential.user, {
      displayName: data.name,
    });
    if (data.role === "vendor") {
      await setDoc(doc(db, "vendors", userCredential.user.uid), defaultVendorData);

      try {
        const docRef = await addDoc(collection(db, "mail"), {
          to: [data.email],
          message: {
            subject: "Welcome email",
            html: `
              <img src=${logoRef} alt="logo" style="height:100px;" />
              <p>Hello, ${data.name}. Thank you for registering as a vendor!</p>
              <p>Your login: ${data.email}.</p>
              <p>Your password: ${data.password}.</p>
            `,
          },
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      await setDoc(doc(db, "userInfo", userCredential.user.uid), defaultAgentData);
    }

    await signOut(auth);
    toast({
      title: "Account created",
      description: "You can now sign in",
    });

    router.push("/auth/signin");
  };

  // Effect in case has role in query params
  useEffect(() => {
    const role = searchParams.get("role");
    if (role && ["agent", "vendor"].includes(role as string)) {
      form.setValue("role", role as Inputs["role"]);
      setFormScreen("user-details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setRegion(form.watch("region"));
  }, [form]);

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
                      onValueChange={(value) => form.setValue("role", value)}
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
              <fieldset className="flex flex-col items-stretch gap-4 w-full">
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="region"
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
                            <SelectTrigger className="w-48">
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
                  name="priceModel"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => form.setValue("priceModel", value)}
                        className="flex flex-col gap-6 md:flex-row w-full"
                      >
                        {Object.keys(pricingNames).map((key) => (
                          <FormItem key={key}>
                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                              <FormControl>
                                <RadioGroupItem value={key} className="sr-only" />
                              </FormControl>
                              <Card className={cn("min-w-[250px] transition-colors duration-300", field.value !== key ? "bg-secondary" : "")}>
                                <CardHeader className="text-center pb-2">
                                  {key == "silver" && <Badge className="uppercase w-max self-center mb-3">
                                    Most popular
                                  </Badge>
                                  }
                                  <CardTitle className="mb-7">{pricingNames[key]} Plan</CardTitle>
                                  <span className="font-bold text-5xl">${pricingModels[region][key].price}</span>
                                </CardHeader>
                                <CardDescription className="text-center">
                                  Perfect for getting started
                                </CardDescription>
                                <CardContent>
                                  <ul className="mt-7 space-y-2.5 text-sm">
                                    <li className="flex space-x-2">
                                      <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                      <span className="text-muted-foreground">${pricingModels[region][key].postPrice} per post</span>
                                    </li>
                                    <li className="flex space-x-2">
                                      <CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
                                      <span className="text-muted-foreground">Up to {pricingModels[region][key].maxPosts} posts per month</span>
                                    </li>
                                  </ul>
                                </CardContent>
                                <CardFooter>
                                  <Button
                                    variant="outline"
                                    className={cn("w-full transition-all duration-300", field.value !== key ? "bg-primary text-white" : "bg-white text-primary border border-primary")}
                                    onClick={() => form.setValue("priceModel", key)}
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

            {error && formScreen === "user-details" && (
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
            {formScreen === "user-type" ? (
              <Button
                className={cn("mt-4")}
                disabled={form.watch("role") === undefined}
                onClick={() => setFormScreen("user-details")}
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
                  type="button"
                  onClick={() => setFormScreen("agent-pricing")}
                >
                  Continue
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
            <p className="text-sm self-center mt-4">
              Already have an account?{" "}
              <Link href="/auth/signin" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </Form >
      </section >
    </>
  );
};

export default Signup;
