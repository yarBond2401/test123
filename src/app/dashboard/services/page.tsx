"use client";

import React, { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

import { OFFERED_SERVICES, OfferedService } from "@/app/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { parse, set } from "date-fns";
import { useRouter } from "next/navigation";
import { AvailabilityPicker } from "./components/availability-picker";
import { RegionPicker } from "./components/region-picker";
import { serviceOffer, serviceOfferSchema } from "./schema";
import { ServiceInDBWithSubcollections, LocationMode } from "./types";
import { submitForm } from "./middleware/submit-form";
import { retrieveForm } from "./middleware/retrieve-form";
import { useFirestoreWithSubcollections } from "@/hooks/useFirestoreWithSubcollection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/firebase";
import { FileField } from "./components/file-field";
import { ServiceRequestCreate } from "../requests/schema";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";

const DynamicGeoPicker = dynamic(() => import("./components/geo-picker").then(module => module.GeoPicker),
  { ssr: false }
);

const generateDayAvailability = (
  open: number,
  close: number,
  closed: boolean = false,
  is24hours: boolean = false
) => ({
  open: parse(open.toString(), "H", new Date()),
  close: parse(close.toString(), "H", new Date()),
  closed,
  is24hours
});

const Services = () => {
  const router = useRouter();
  const [locationMode, setLocationMode] = useState<LocationMode>("regional");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [retrievedGeo, setRetrievedGeo] = useState<number[] | null>(null);
  const { user } = useRequireLogin({
    onUnauthenticated: () => router.push("/auth/signin"),
  });
  const { data: retrievedFromDB } = useFirestoreWithSubcollections(
    user?.uid ? `vendors/${user.uid}` : null,
    ["services"]
  );

  const { toast } = useToast();

  const checkAndSet24Hours = (availability: any) => {
    Object.keys(availability).forEach(day => {
      if (availability[day].open && availability[day].close) {
        const openTime = new Date(availability[day].open);
        const closeTime = new Date(availability[day].close);

        const opensAtMidnight = openTime.getHours() === 0 && openTime.getMinutes() === 0 && openTime.getSeconds() === 0;
        const closesAtEndOfDay = closeTime.getHours() === 23 && closeTime.getMinutes() === 59 && closeTime.getSeconds() === 0;
        availability[day].is24hours = opensAtMidnight && closesAtEndOfDay;
      } else {
        availability[day].is24hours = false;
      }
    });

    return availability;
  };


  // set fields with the data retrieved from the database
  useEffect(() => {
    if (!retrievedFromDB) return;
    const r = retrieveForm(retrievedFromDB as ServiceInDBWithSubcollections);

    if (!r?.serviceSelect) return;

    form.setValue("description", r.description);
    if (Object.keys(r.generic_availability).length > 0) {
      const updatedAvailability = checkAndSet24Hours(r.generic_availability);
      form.setValue("generic_availability", updatedAvailability);
    }
    form.setValue("serviceSelect", r.serviceSelect);
    form.setValue("serviceDetails", r.serviceDetails);

    if (r.locationMode === "regional") {
      form.setValue("locations", r.locations)
      setLocationMode("regional");
    } else if (r.locationMode === "geolocation") {
      // @ts-ignore
      // console.log("retrieved", r)
      form.setValue("location_zip", r.location_zip);
      setLocationMode("geolocation");
      httpsCallable(functions, "get_location_from_zip")({ zip: r.location_zip?.zip }).then(
        ({ data }: any) => {
          const lat = data?.lat! as number;
          const lng = data?.lng! as number;
          setRetrievedGeo([
            lat,
            lng
          ])
        }
      )
    } else if (r.locationMode === "nationwide") {
      setLocationMode("nationwide");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrievedFromDB]);

  const [selectedServices, setSelectedServices] = useState<OfferedService[]>(
    []
  );
  const form = useForm<serviceOffer>({
    defaultValues: {
      generic_availability: {
        mo: generateDayAvailability(8, 17),
        tu: generateDayAvailability(8, 17),
        we: generateDayAvailability(8, 17),
        th: generateDayAvailability(8, 17),
        fr: generateDayAvailability(8, 17),
        sa: generateDayAvailability(8, 12),
        su: generateDayAvailability(8, 12, true),
      },
      description: "",
      serviceSelect: {},
      locations: [],
    },
    resolver: zodResolver(serviceOfferSchema),
    mode: "all",
  });

  const onSubmitError = (errors: any) => {
    console.log(errors);

    // Force validation to show errors on the form
    Object.keys(errors).forEach(field => {
      form.trigger(field);
    });

    if (form.formState.errors) {
      toast({
        toastType: "error",
        title: "Error submitting form",
        description: "Please check the form for errors",
      });
    }
  };

  const onSubmit = (data: serviceOffer) => {
    if (!user) return;
    setIsSubmitting(true);
    console.log("submitting", JSON.stringify(data));
    console.log("gg", JSON.stringify(user));

    submitForm(
      data,
      user,
      locationMode,
      () => setIsSubmitting(false)
    );
  };

  // This effect update the selected service in order to display the service details
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (!name) return;
      if (name.startsWith("serviceSelect")) {
        const selected = Object.entries(value.serviceSelect || {})
          .filter(([_, value]) => value)
          .map(([key, _]) => key);
        const updatedSelectedServices = OFFERED_SERVICES.filter((service) =>
          selected.includes(service.id)
        );
        setSelectedServices(updatedSelectedServices);

        // Remove service details for unselected services
        const currentServiceDetails = form.getValues("serviceDetails");
        const updatedServiceDetails = { ...currentServiceDetails };
        Object.keys(updatedServiceDetails).forEach((serviceId) => {
          if (!selected.includes(serviceId)) {
            // @ts-ignore
            delete updatedServiceDetails[serviceId];
          }
        });
        form.setValue("serviceDetails", updatedServiceDetails);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader className="max-w-xl">
          <CardTitle>My services</CardTitle>
          <CardDescription>
            Here you can edit your availability and the services you offer
          </CardDescription>
          <Separator />
        </CardHeader>
        <CardContent className="max-w-xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
              className="flex flex-col gap-4"
            >
              <FormField
                name="serviceSelect"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services Offered</FormLabel>
                    <FormDescription>
                      Select all the services you offer
                    </FormDescription>
                    {OFFERED_SERVICES.filter((s) =>
                      user?.email !== "david.marketing@mrkt.io" ? s.id !== "marketing" : true
                    ).map((service) => (
                      <FormField
                        key={`servoce-${service.id}`}
                        control={form.control}
                        name={`serviceSelect.${service.id}`}
                        render={({ field: subfield }) => (
                          <FormItem>
                            <div className="flex flex-row items-center gap-2">
                              <FormControl className="flex items-center gap-2">
                                <Checkbox
                                  checked={form.watch(
                                    `serviceSelect.${service.id}`
                                  )}
                                  onCheckedChange={subfield.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.name}
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="serviceDetails"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service details</FormLabel>
                    <FormDescription>
                      Add details to your services
                    </FormDescription>
                    <Accordion type="multiple">
                      {selectedServices.map((service) => (
                        <AccordionItem value={service.id} key={`accord-${service.id}`}>
                          <AccordionTrigger
                            className="flex justify-start items-center gap-2"
                          >
                            {service.name}
                            <small className="font-normal text-destructive">
                              {
                                form.formState.errors?.serviceDetails?.[
                                service.id
                                ] && " - Please complete this section"
                              }
                            </small>
                          </AccordionTrigger>
                          <AccordionContent className="py-4">
                            <div className="flex flex-col gap-4">
                              {service.fields.map((serviceField) => (
                                <FormField
                                  key={`form-${serviceField.id}`}
                                  control={form.control}
                                  name={`serviceDetails.${service.id}.${serviceField.id}`}
                                  render={({ field: subfield }) => (
                                    <FormItem>
                                      {
                                        {
                                          text: (
                                            <>
                                              <FormLabel>
                                                {serviceField.label}
                                              </FormLabel>
                                              <FormDescription>
                                                {serviceField.description}
                                              </FormDescription>
                                              <FormControl>
                                                <Input
                                                  type="text"
                                                  value={
                                                    (subfield.value as string) ||
                                                    ""
                                                  }
                                                  onChange={subfield.onChange}
                                                  placeholder={
                                                    serviceField.placeholder
                                                  }
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </>
                                          ),
                                          textarea: (
                                            <>
                                              <FormLabel>
                                                {serviceField.label}
                                              </FormLabel>
                                              <FormDescription>
                                                {serviceField.description}
                                              </FormDescription>
                                              <FormControl>
                                                <Textarea
                                                  value={
                                                    (subfield.value as string) ||
                                                    ""
                                                  }
                                                  placeholder={
                                                    serviceField.placeholder
                                                  }
                                                  onChange={subfield.onChange}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </>
                                          ),
                                          checkbox: (
                                            <>
                                              <FormItem className="flex align-center space-y-0 gap-2">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={
                                                      subfield.value as boolean
                                                    }
                                                    onCheckedChange={
                                                      subfield.onChange
                                                    }
                                                  />
                                                </FormControl>
                                                <FormLabel>
                                                  {serviceField.label}
                                                </FormLabel>
                                              </FormItem>
                                              <FormDescription>
                                                {serviceField.description}
                                              </FormDescription>
                                            </>
                                          ),
                                          select: (
                                            <>
                                              <FormLabel>
                                                {serviceField.label}
                                              </FormLabel>
                                              <FormDescription>
                                                {serviceField.description}
                                              </FormDescription>
                                              <FormControl>
                                                <Select
                                                  value={form.watch(
                                                    `serviceDetails.${service.id}.${serviceField.id}`
                                                  )}
                                                  onValueChange={
                                                    subfield.onChange
                                                  }
                                                >
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select an option" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    {serviceField?.options
                                                      ?.length &&
                                                      serviceField.options.map(
                                                        (option: {
                                                          value: string;
                                                          label: string;
                                                        }) => (
                                                          <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                          >
                                                            {option.label}
                                                          </SelectItem>
                                                        )
                                                      )}
                                                  </SelectContent>
                                                </Select>
                                              </FormControl>
                                              <FormMessage />
                                            </>
                                          ),
                                          file: (
                                            <>
                                              <FormLabel>
                                                {serviceField.label}
                                              </FormLabel>
                                              <FormDescription>
                                                {serviceField.description}
                                              </FormDescription>
                                              <FormControl>
                                                <FileField
                                                  path={`serviceDetails/${user?.uid}/${service.id}.pdf`}
                                                  value={subfield.value as string}
                                                  onChange={subfield.onChange}
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </>
                                          )
                                        }[serviceField.type as string]
                                      }
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormLabel>Location</FormLabel>
              <FormDescription>
                Select how you would like the users to find you. It can either be
                by region or by your geolocation. <br />
                You can also select nationwide if that is the case.
              </FormDescription>
              <Tabs
                defaultValue="regional"
                className="w-full"
                value={locationMode}
                onValueChange={(value) =>
                  setLocationMode(value as LocationMode)
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="geolocation">Geolocation</TabsTrigger>
                  <TabsTrigger value="regional">Custom</TabsTrigger>
                  <TabsTrigger value="nation-wide">Nationwide</TabsTrigger>
                </TabsList>
                <TabsContent value="regional">
                  <RegionPicker form={form} />
                </TabsContent>
                <TabsContent value="geolocation">
                  {/* @ts-ignore */}
                  <DynamicGeoPicker form={form as UseFormReturn<ServiceRequestCreate>} retrievedGeo={retrievedGeo} />
                </TabsContent>
                <TabsContent value="nation-wide">
                  <FormDescription>
                    You are available nationwide
                  </FormDescription>
                  <FormItem
                    className="px-8 py-4"
                  >
                    <svg
                      className="w-full h-content fill-slate-200"
                      preserveAspectRatio="xMidYMid meet"
                      version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800.68372 433.96184" xmlSpace="preserve">
                      <g transform="translate(-3.7792986e-4,-183.361)">
                        <path d="m 800.196,248.076 c -0.079,-0.108 -0.205,-0.206 -0.318,-0.311 -6.391,-6.022 -50.159,-2.275 -50.159,-2.275 0,0 -0.271,0.932 -0.969,2.275 -1.485,2.859 -4.936,7.608 -11.979,9.373 -10.354,2.586 -157.908,5.172 -161.791,-5.181 -0.653,-1.75 -1.818,-3.104 -3.258,-4.192 -7.063,-5.335 -21.334,-3.572 -21.334,-3.572 0,0 -1.106,1.468 -2.892,3.572 -4.027,4.749 -11.538,12.752 -17.817,14.545 -7.013,2.005 -8.585,-6.84 -7.745,-14.545 0.245,-2.247 0.688,-4.405 1.271,-6.16 1.812,-5.438 -15.428,-24.205 -29.918,-33.632 -6.192,-4.025 -11.893,-6.361 -15.382,-5.198 -11.647,3.883 -72.487,-19.414 -72.487,-19.414 H 193.214 28.763 c 0,0 -0.792,8.261 -2.147,15.461 -0.127,0.667 -0.257,1.32 -0.393,1.963 -0.638,3.021 -1.376,5.687 -2.207,7.188 -0.54,0.981 -1.117,1.474 -1.722,1.27 -0.556,-0.184 -1.367,-0.653 -2.327,-1.27 -5.751,-3.691 -17.458,-13.335 -19.68,-7.79 -0.709,1.771 -0.035,4.533 1.279,7.79 3.495,8.65 11.664,20.935 11.664,28.452 0,1.654 0,5.685 0,11.34 0,6.453 0,15.019 0,24.615 0,12.354 0,26.394 0,39.79 0,8.698 0,17.113 0,24.615 0,13.418 0,23.909 0,27.781 0,5.052 3.265,8.64 7.358,12.009 7.435,6.127 17.61,11.546 15.939,23.768 -0.039,0.284 -0.045,0.564 -0.069,0.847 -1.217,14.422 16.472,29.532 28.742,39.79 3.649,3.051 6.822,5.676 8.865,7.719 3.774,3.775 9.119,10.467 14.632,16.895 7.727,9.014 15.784,17.514 20.315,16.762 7.766,-1.295 22.005,-6.475 31.065,3.883 7.56,8.643 42.152,17.273 59.413,19.146 h 9.94 c 9.832,-1.316 35.456,-4.867 50.457,0 5.52,1.793 9.604,4.719 10.919,9.326 1.528,5.346 4.308,10.566 7.449,15.289 7.509,11.279 17.142,19.658 17.142,19.658 0,0 6.475,-10.354 10.356,-18.121 0.297,-0.596 0.687,-1.104 1.138,-1.537 2.18,-2.104 6.041,-2.312 10.43,0 6.632,3.496 14.46,12.76 19.498,30.016 1.013,3.477 2.396,6.723 4.025,9.773 5.7,10.674 14.598,18.828 22.798,24.613 10.465,7.383 19.773,10.912 19.773,10.912 0,0 0,-4.547 0.083,-10.912 0.093,-7.191 0.291,-16.697 0.714,-24.613 0.139,-2.613 0.302,-5.062 0.495,-7.188 1.294,-14.234 44.009,-27.182 51.773,-28.479 7.768,-1.293 59.541,22.008 59.541,14.244 0,-6.521 8.226,-12.139 17.755,-18.367 1.82,-1.189 3.681,-2.396 5.547,-3.641 4.116,-2.748 9.204,-0.309 14.114,3.641 8.995,7.219 17.404,19.5 18.24,14.484 1.293,-7.771 25.89,-3.883 28.476,5.174 1.524,5.344 3.497,12.938 4.599,20.131 0.767,4.998 1.108,9.811 0.583,13.525 -0.363,2.545 1.315,6.627 4.007,11.086 6.887,11.42 20.383,25.355 23.176,22.562 1.706,-1.703 3.664,-11.434 4.442,-22.562 0.583,-8.346 0.49,-17.475 -0.86,-24.611 -0.944,-4.975 -2.496,-8.982 -4.878,-11.068 -4.604,-4.029 -8.18,-15.992 -9.829,-28.721 -1.108,-8.602 -1.342,-17.529 -0.407,-24.619 0.791,-6.014 2.42,-10.693 5.061,-12.674 4.068,-3.051 18.512,-14.281 33.693,-27.113 9.606,-8.121 19.513,-16.881 27.268,-24.613 11.199,-11.164 17.926,-20.192 12.814,-22.051 -8.366,-3.045 -9.562,-8.799 -8.615,-17.739 0.664,-6.264 2.371,-14.078 3.436,-23.677 0.039,-0.334 0.086,-0.623 0.129,-0.938 2.915,-21.554 18.086,4.392 24.474,-24.954 1.341,-6.175 4.817,-11 9.393,-14.836 17.461,-14.656 51.124,-14.71 44.966,-18.813 -1.896,-1.271 -3.253,-3.322 -4.066,-5.802 -2.514,-7.642 0.136,-19.402 7.949,-25.264 4.006,-3.001 12.067,-8.515 20.148,-14.526 12.833,-9.543 25.739,-20.334 22.56,-24.304 z" />
                      </g>
                    </svg>
                  </FormItem>
                </TabsContent>
              </Tabs>
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>About us</FormLabel>
                    <FormDescription>
                      Describe yourself and the services you offer. Max 500 characters
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        maxLength={500}
                        // @ts-ignore
                        style={{ fieldSizing: "content" }}
                        placeholder="I am a professional plumber with 10 years of experience. I offer services in the greater Los Angeles area. I am available 24/7 for emergency calls."
                      />
                    </FormControl>
                    <FormDescription
                      className="self-end text-sm text-gray-500 mt-1"
                    >
                      {form.watch("description")?.length || 0} / 500
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AvailabilityPicker form={form} />
              <Button
                className="mt-2 w-full"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin text-gray-500" /> : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Services;
