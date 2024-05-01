// import { Check, ChevronsUpDown } from "lucide-react";
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";
import React, { useEffect, useOptimistic, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import useMeasure from "react-use-measure";
import { MdClose } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { serviceOffer } from "../schema";
import { Suggestion } from "./types";
import { object } from "zod";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { OfferedService } from "@/app/constants";
import AutoCompleteInput from "@/app/dashboard/services/components/google-autocomplete";

interface RegionPickerProps {
  form: UseFormReturn<serviceOffer>;
}

type Unpacked<T> = T extends (infer U)[] ? U : T;

// TODO: Isolate this into a separate file and use
const headers = {
  "Content-Type": "application/json",
  "X-Goog-Api-Key": process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
};

const URL_MAPS = "https://places.googleapis.com/v1/places:autocomplete";
const URL_DETAILS = "https://places.googleapis.com/v1/places/";

const getPlaceType = (place: Suggestion) => {
  if (place.placePrediction.types.includes("locality")) {
    return "city";
  } else if (
    place.placePrediction.types.includes("administrative_area_level_1")
  ) {
    return "state";
  } else if (
    place.placePrediction.types.includes("administrative_area_level_2")
  ) {
    return "county";
  }
  return "";
};

export const RegionPicker: React.FC<RegionPickerProps> = ({ form }) => {
  const [autocompleted, setAutocompleted] = useState<Suggestion[]>([]);
  const [query, setQuery] = useState("");
  const [delayedQuery, setDelayedQuery] = useState("");
  const [ref, bounds] = useMeasure();

  // useEffect(() => {
  //   const subscription = form.watch((value, { name, type }) => {
  //     if (name === "locations") {
  //       console.log(value.locations)
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [form.watch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const queryAutoComplete = async (query: string) => {
    if (query.length < 3) {
      return;
    }

    const data = await fetch(URL_MAPS, {
      headers,
      method: "POST",
      body: JSON.stringify({
        input: query,
        includedPrimaryTypes: [
          "administrative_area_level_1",
          "administrative_area_level_2",
          "locality",
        ],
        includedRegionCodes: ["us"],
        languageCode: "en",
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

    if (!data?.suggestions || data.suggestions.length === 0) {
      setAutocompleted([]);
      return;
    }
    setAutocompleted(data.suggestions);
  };

  useEffect(() => {
    queryAutoComplete(delayedQuery);
  }, [delayedQuery]);

  const handleSelect = async (
    option: string,
    prev: serviceOffer["locations"]
  ) => {
    try {
      let newLocations;
      // @ts-ignore
      if (prev.some((item) => item.id === option)) {
        // @ts-ignore
        newLocations = prev.filter((item) => item.id !== option);
      } else {
        const res = await fetch(
          URL_DETAILS + option + "?languageCode=en",
          {
            headers: {
              ...headers,
              "X-Goog-FieldMask":
                "id,location,shortFormattedAddress,formattedAddress,adrFormatAddress,addressComponents",
            },
          }
        ).then((res) => res.json());

        let formatted = formatRegion(res);
        // @ts-ignore
        newLocations = [...prev, formatted];
      }
      form.setValue("locations", newLocations);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const handleRemove = (option: string) => {
    const newLocations = form.getValues("locations")!
      .filter((item) => item.id !== option);
    form.setValue("locations", newLocations);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="locations"
        render={({ field }) => (
          <>
            <FormItem>
              <FormDescription>
                Select one or many areas: could be a city, county, state, or a combination of these
              </FormDescription>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full"
                      ref={ref}
                    >
                      {"Select a location"}
                      <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  side="bottom"
                  style={{ width: bounds.width }}
                >
                  <Command shouldFilter={false}>
                    <AutoCompleteInput placeholder="Search for a city" onPlaceSelected={setQuery}/>
                    {/*<CommandInput
                      placeholder="Search for a city"
                      value={query}
                      onValueChange={setQuery}
                    />*/}
                    <CommandEmpty>No locations found</CommandEmpty>
                    <CommandGroup>
                      {autocompleted.map((option) => (
                        <CommandItem
                          key={option.placePrediction.placeId}
                          onSelect={(_) =>
                            handleSelect(
                              option.placePrediction.placeId,
                              field.value
                            )
                          }
                        >
                          <LuCheck
                            className={cn(
                              "w-4 h-4 mr-2",
                              // @ts-ignore
                              field.value.some(
                                (item) =>
                                  item.id === option.placePrediction.placeId
                              )
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            {option.placePrediction.text.text.endsWith(", USA")
                              ? option.placePrediction.text.text.replace(
                                ", USA",
                                ""
                              )
                              : option.placePrediction.text.text}
                            <small>{getPlaceType(option)}</small>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
            <Card className="shadow-none mt-2">
              {
                // @ts-ignore
                field.value.length > 0 ? (
                  // @ts-ignore
                  field.value.map((location) => (
                    <CardHeader
                      className="grid-container grid grid-cols-10 space-y-0 items-center px-4 py-4"
                      key={location.id}
                    >
                      <div className="col-span-9">
                        {location.name}
                        <small className="text-gray-500 ml-2">
                          {location.type}
                        </small>
                      </div>
                      <Button
                        variant="secondary"
                        className="col-span-1"
                        type="button"
                        onClick={() => handleRemove(location.id)}
                      >
                        <MdClose />
                      </Button>
                    </CardHeader>
                  ))
                ) : (
                  <>
                    <CardHeader className="grid-container grid grid-cols-10 space-y-0 items-center px-4 py-4">
                      <div className="col-span-9">No locations added</div>
                    </CardHeader>
                  </>
                )}
            </Card>
          </>
        )}
      />
    </>
  );
};


const formatRegion = (details: any) => {
  const components = details.addressComponents;
  const mainComponent = components[0];
  let obj: any = { name: mainComponent.longText, id: details.id };

  if (mainComponent.types.includes("locality")) {
    obj["type"] = "city";
  } else if (mainComponent.types.includes("administrative_area_level_1")) {
    obj["type"] = "state";
  } else if (mainComponent.types.includes("administrative_area_level_2")) {
    obj["type"] = "county";
  } else {
    throw new Error("Invalid region type");
  }

  return obj as {
    name: string;
    type: string;
    id: string;
  }
}
