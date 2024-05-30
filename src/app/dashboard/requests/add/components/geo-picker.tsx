"use client";

import "leaflet/dist/leaflet.css";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { UseFormReturn } from "react-hook-form";
// import { Check, ChevronsUpDown } from "lucide-react";
import { LuChevronsUpDown, LuLocate } from "react-icons/lu";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import useMeasure from "react-use-measure";

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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { useGeolocation } from "@uidotdev/usehooks";

import { ServiceRequestCreate, ServiceSignInRequestCreate } from "../../schema";
import { customIcon } from "@/lib/customIcon";
import { LatLng } from "leaflet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Suggestion } from "@/app/dashboard/services/components/types";

interface GeoPickerProps {
    form: UseFormReturn<ServiceRequestCreate | ServiceSignInRequestCreate>;
}

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_URL = "https://places.googleapis.com/v1/places/";

const MAPS_HEADERS = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": 'AIzaSyD524tP59AM7saqTbA33HvU4IU98bdxy90',
};

export const GeoPicker: React.FC<GeoPickerProps> = ({ form }) => {
    const [map, setMap] = useState(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [delayedQuery, setDelayedQuery] = useState<string>("");
    const [autocomplete, setAutocomplete] = useState([] as Suggestion[]);
    const [selected, setSelected] = useState<Suggestion | null>(null);
    const [position, setPosition] = useState<LatLng>(
        new LatLng(37.828724, -122.355537)
    );
    const geolocation = useGeolocation();
    const [ref, bounds] = useMeasure();

    const mapToLocation = () => {
        if (!map) return;
        if (!geolocation.latitude || !geolocation.longitude) return;
        // @ts-ignore
        map.setView([geolocation.latitude, geolocation.longitude], 11);
    }

    const onMove = useCallback(() => {
        if (map) {
            // @ts-ignore
            setPosition(map.getCenter());
        }
        // setSelected(null);
        // setAutocomplete([]);
    }, [map]);

    useEffect(() => {
        let mapRefCurrent = map;
        if (!mapRefCurrent) return;
        // @ts-ignore
        mapRefCurrent.on("move", onMove);
        // @ts-ignore
        mapRefCurrent.on("drag", () => {
            setSelected(null);
            setAutocomplete([]);
        })
        // @ts-ignore
        mapRefCurrent.attributionControl.setPrefix("");
        return () => {
            // @ts-ignore   
            mapRefCurrent.off("move", onMove);
            // @ts-ignore
            mapRefCurrent.off("drag", () => {
                setSelected(null);
                setAutocomplete([]);
            })
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    const displayMap = useMemo(() => {
        return (
            <MapContainer
                zoom={11}
                center={position}
                scrollWheelZoom={true}
                className="w-full h-96 z-0"
                // key={new Date().getTime()}
                // @ts-ignore
                ref={setMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={customIcon} />
            </MapContainer>
        );
    }, [position]);

    useEffect(() => {
        const delayTimeoutId = setTimeout(() => {
            form.setValue("location", {
                latitude: position.lat,
                longitude: position.lng,
            });
        }, 500);
        return () => clearTimeout(delayTimeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

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

        const data = await fetch(AUTOCOMPLETE_URL, {
            headers: MAPS_HEADERS,
            method: "POST",
            body: JSON.stringify({
                input: query,
                includedRegionCodes: ["us"],
                languageCode: "en",
            }),
        })
            .then((res) => res.json())
            .catch((err) => console.error(err));

        if (!data?.suggestions || data.suggestions.length === 0) {
            setAutocomplete([]);
            return;
        }

        setAutocomplete(data.suggestions);
    };

    useEffect(() => {
        queryAutoComplete(delayedQuery);
    }, [delayedQuery]);

    const handleSelect = async (option: Suggestion) => {
        // search for details and set selected
        const data = await fetch(`${DETAILS_URL}${option.placePrediction.placeId}`, {
            headers: {
                ...MAPS_HEADERS,
                "X-Goog-FieldMask":
                    "id,location,shortFormattedAddress,formattedAddress",
            }
        })
            .then((res) => res.json())
            .catch((err) => console.error(err));
        setSelected(option);
        setPosition(new LatLng(data.location.latitude, data.location.longitude));
        // @ts-ignore
        map.flyTo([data.location.latitude, data.location.longitude], 14);
        setQuery("");
        setOpen(false);
    }


    if (geolocation.loading) {
        return (
            <FormDescription>
                You may need to allow location access to use this feature
            </FormDescription>
        );
    }


    if (geolocation.error) {
        return (
            <FormDescription>
                {geolocation.error.message}
            </FormDescription>
        );
    }

    return (
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormDescription>
                        Put the location this services will be delivered at.
                    </FormDescription>
                    <Popover
                        open={open}
                        onOpenChange={setOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                ref={ref}
                                type="button"
                                variant="outline"
                                className="w-full flex justify-between items-center"
                            >
                                <FormLabel
                                    // i dont want this to overflow
                                    className="overflow-hidden whitespace-nowrap"
                                >{
                                        selected
                                            ? selected.placePrediction.text.text
                                            : "Search for a place"
                                    }</FormLabel>
                                <LuChevronsUpDown />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="p-0"
                            align="start"
                            side="bottom"
                            style={{ width: bounds.width }}
                        >
                            <Command
                                shouldFilter={false}
                            >
                                <CommandInput
                                    placeholder="Search for a place"
                                    value={query}
                                    onValueChange={setQuery}
                                />
                                <CommandEmpty>Type at least 3 characters</CommandEmpty>
                                <CommandGroup>
                                    {
                                        autocomplete.map((option) => (

                                            <CommandItem
                                                key={option.placePrediction.placeId}
                                                onSelect={(_) => handleSelect(option)}
                                            >
                                                {option.placePrediction.text.text}
                                            </CommandItem>
                                        ))
                                    }
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {displayMap}
                    <Button
                        type="button"
                        variant="default"
                        className="w-full flex justify-between items-center"
                        onClick={mapToLocation}
                    >
                        <FormLabel>Use my location</FormLabel>
                        <LuLocate />
                    </Button>
                    <FormDescription>
                        {`Latitude: ${position.lat.toFixed(
                            6
                        )}, Longitude: ${position.lng.toFixed(6)}`}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
