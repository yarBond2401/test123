import React, { useEffect } from 'react';
import { add, format } from 'date-fns';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { MdDelete, MdEdit } from 'react-icons/md';

import { OFFERED_SERVICES } from '@/app/constants';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TimePicker12 } from '@/components/ui/time-picker';

import { ServiceRequestCreate } from '../../schema';

interface ServicePickerProps {
  form: UseFormReturn<ServiceRequestCreate>;
}


const QUERIABLE_SERVICES = [
  ...OFFERED_SERVICES,
  // {
  //   id: "marketing",
  //   name: "Marketing",
  //   fields: []
  // }
]

export const ServicePicker: React.FC<ServicePickerProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // useEffect(() => {
  //   const subscriber = form.watch((value, { name, type }) => {
  //     console.log("name", name)
  //     console.log("type", type)
  //     console.log("value", value)
  //   })
  //   return subscriber.unsubscribe
  // }, [for])

  // useEffect(() => {
  //   console.log(form.formState.errors)
  // }, [form.formState.errors])

  const selectedServiceIds = new Set(fields.map(service => service.serviceName));

  return (
    <FormField
      control={form.control}
      name="services"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Services</FormLabel>
          <FormDescription>
            Select the services you need
          </FormDescription>
          {
            fields.map((service, index) => (
              <Card className="shadow-none p-4" key={service.id}>
                <div className="flex flex-row justify-between">
                  <div>
                    <p>
                      {
                        form.watch(`services.${index}.serviceName`) || "Select service"
                      }
                    </p>
                    <p className="text-gray-500 text-sm">
                      {
                        form.watch(`services.${index}.maxPrice`) === 0 ? "No limit" : `$${form.watch(`services.${index}.maxPrice`)} max`
                      }
                    </p>
                  </div>
                  <div className="flex flex-row gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="p-0 aspect-square"
                        >
                          <MdEdit />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Service details</DialogTitle>
                          <DialogDescription>
                            Select the service you need
                          </DialogDescription>
                        </DialogHeader>
                        <FormField
                          control={form.control}
                          name={`services.${index}.serviceName`}
                          render={({ field: subfield }) => (
                            <FormItem>
                              <FormLabel>
                                Service name
                              </FormLabel>
                              <Select
                                onValueChange={subfield.onChange}
                                value={subfield.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {
                                    QUERIABLE_SERVICES.filter(service => !selectedServiceIds.has(service.id))
                                      .map((service) => (
                                        <SelectItem
                                          key={service.id}
                                          value={service.id}
                                        >
                                          {service.name}
                                        </SelectItem>
                                      ))

                                  }
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          name={`services.${index}.maxPrice`}
                          control={form.control}
                          render={({ field: subfield }) => (
                            <FormItem>
                              <FormLabel>
                                Max price
                              </FormLabel>
                              <FormDescription>
                                Maximum price, 0 for no limit
                              </FormDescription>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={400}
                                  step={10}
                                  defaultValue={[0]}
                                  value={[subfield.value]}
                                  onValueChange={(value) => subfield.onChange(value[0])}
                                />
                              </FormControl>
                              <FormDescription>
                                {subfield.value === 0 ? "No limit" : `$${subfield.value}`}
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        {
                          /* <FormLabel>
                                                      Filters:
                            </FormLabel>
                            {
                                // @ts-ignore
                                // field.serviceName && (
                                //     QUERIABLE_SERVICES.find((service) => service.id === field.serviceName)
                                // )
  
                                QUERIABLE_SERVICES.find((service) => service.id === form.watch(`services.${index}.serviceName`))?.fields.map((serviceFields) => (
                                    <React.Fragment key={serviceFields.id}>
  
                                        {
                                            {
                                                select: (
                                                    <FormField
                                                        control={form.control}
                                                        name={`services.${index}.additionalFields.${serviceFields.id}`}
                                                        render={({ field: subfield }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    {serviceFields.label}
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={subfield.onChange}
                                                                    value={subfield.value}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {
                                                                            serviceFields.options.map((option: any) => (
                                                                                <SelectItem
                                                                                    key={option.value as string}
                                                                                    value={option.value as string}
                                                                                >
                                                                                    {option.label as string}
                                                                                </SelectItem>
                                                                            ))
                                                                        }
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ),
                                                checkbox: (
                                                    <FormField
                                                        control={form.control}
                                                        name={`services.${index}.additionalFields.${serviceFields.id}`}
                                                        render={({ field: subfield }) => (
                                                            <FormItem className="flex items-center space-y-0 gap-2">
                                                                <Checkbox
                                                                    checked={subfield.value}
                                                                    onCheckedChange={subfield.onChange}
                                                                />
                                                                <FormLabel>
                                                                    {serviceFields.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ),
                                                // @ts-ignore
                                            }[serviceFields.type as string]
                                        }
                                    </React.Fragment>
                                ))
                            } */
                        }
                        <div className="flex flex-row gap-2">
                          <Switch
                            onCheckedChange={(checked) => {
                              if (checked) {
                                form.setValue(`services.${index}.datetime`, form.getValues("datetime"))
                              } else {
                                let currentValue = form.getValues(`services.${index}`)
                                form.setValue(`services.${index}.datetime`, undefined)
                              }
                            }}
                          />
                          <FormDescription>
                            Choose a different time for this service
                          </FormDescription>
                        </div>
                        {
                          typeof form.watch(`services.${index}`)?.datetime !== "undefined" && (
                            <FormField
                              control={form.control}
                              name={`services.${index}.datetime`}
                              render={({ field: subfield }) => (
                                <FormItem>
                                  <FormLabel>
                                    Date and time
                                  </FormLabel>
                                  <FormDescription>
                                    Select the date and time for this service
                                  </FormDescription>
                                  <FormControl>
                                    <>
                                      <Calendar
                                        mode="single"
                                        selected={subfield.value}
                                        //select date without changed time using date-fns
                                        onSelect={
                                          (date) => {
                                            if (!date) {
                                              field.onChange(date!)
                                            } else {
                                              const newDate = new Date(
                                                date.getFullYear(),
                                                date.getMonth(),
                                                date.getDate(),
                                                subfield.value!.getHours(),
                                                subfield.value!.getMinutes(),
                                                subfield.value!.getSeconds(),
                                                subfield.value!.getMilliseconds()
                                              );
                                              subfield.onChange(newDate);
                                            }
                                          }
                                        }
                                        disabled={(date) => date < add(new Date(), { days: - 1 })}
                                        initialFocus
                                      />
                                      <TimePicker12
                                        className="self-center mb-2"
                                        value={subfield.value}
                                        onChange={(date) => subfield.onChange(date)}
                                      />
                                    </>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )
                        }
                        <DialogClose asChild>
                          <Button type="button" variant="default">
                            Save
                          </Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                      className="p-0 aspect-square"
                    >
                      <MdDelete
                        className="h-full"
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          }
          <Button
            className="w-full mt-4"
            type="button"
            variant="outline"
            onClick={() => append({
              serviceName: "",
              candidates: [],
              maxPrice: 0,
            })}
          >
            Add service
          </Button>
        </FormItem>
      )}
    />
  )
}