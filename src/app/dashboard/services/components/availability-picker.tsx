import { Card, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, parse } from "date-fns";
import React, { useEffect } from "react";
import { Form, UseFormReturn, useWatch } from "react-hook-form";
import { DAYS_OF_WEEK, serviceOffer } from "../schema";
import { cn } from "@/lib/utils";
import { TimePicker12 } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MdEdit } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilityPickerProps {
  form: UseFormReturn<serviceOffer>;
}

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  form,
}) => {
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && name?.startsWith("generic_availability")) {
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);


  return (
    <FormField
      control={form.control}
      name="generic_availability"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Availability</FormLabel>
          <FormDescription>
            Select the days and times you are available
          </FormDescription>
          <div className="flex gap-2 flex-col">
            {DAYS_OF_WEEK.map((day) => (
              <Card
                className={cn("flex flex-1 gap-2 justify-between shadow-none")}
                key={day}
              >
                <CardHeader className="flex flex-col justify-between w-full items-center gap-2 md:flex-row py-2">
                  <h3 className="text-sm font-medium">
                    {format(parse(day, "eee", new Date()), "eeee")}
                  </h3>
                  <div className="flex self-center gap-2 items-center">
                    <div className="flex flex-col items-end">
                      {!form.watch(
                        `generic_availability.${day}.closed` as const
                      ) ? (
                        <>
                          <div>
                            opens at{" "}
                            {format(
                              form.watch(
                                `generic_availability.${day}.open` as const
                              ),
                              "h:mm aaa"
                            )}
                          </div>
                          <div>
                            closes at{" "}
                            {format(
                              form.watch(
                                `generic_availability.${day}.close` as const
                              ),
                              "h:mm aaa"
                            )}
                          </div>
                        </>
                      ) : (
                        <>Closed</>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary">
                          <MdEdit />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <FormField
                          control={form.control}
                          name={`generic_availability.${day}.closed`}
                          render={({ field: subfield }) => (
                            <FormItem className="flex flex-col gap-2 items-center">
                              <FormLabel>Closed</FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={subfield.value}
                                  onCheckedChange={subfield.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {!form.watch(
                          `generic_availability.${day}.closed` as const
                        ) && (
                            <>
                              <FormField
                                control={form.control}
                                name={`generic_availability.${day}.open`}
                                render={({ field: subfield }) => (
                                  <FormItem className="flex flex-col gap-2 items-center">
                                    <FormLabel>Open time</FormLabel>
                                    <FormControl>
                                      <TimePicker12
                                        value={subfield.value}
                                        onChange={subfield.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`generic_availability.${day}.close`}
                                render={({ field: subfield }) => (
                                  <FormItem className="flex flex-col gap-2 items-center">
                                    <FormLabel>Close time</FormLabel>
                                    <FormControl>
                                      <TimePicker12
                                        value={subfield.value}
                                        onChange={subfield.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        <DialogClose asChild>
                          <Button>Save</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
