"use client";

import "leaflet/dist/leaflet.css";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UseFormReturn } from "react-hook-form";
import { MapContainer, Marker, TileLayer, ScaleControl, Circle } from "react-leaflet";
// @ts-ignore
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useGeolocation } from "@uidotdev/usehooks";

import { serviceOffer } from "../schema";
import { customIcon } from "@/lib/customIcon";
import { LatLng } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZipToLocation } from "./types";
import { toast } from "@/components/ui/use-toast";

interface GeoPickerProps {
  form: UseFormReturn<serviceOffer>;
  retrievedGeo: number[] | null;
}

const getZoom = (radius: number) => {
  if (radius <= 5) return 11;
  if (radius <= 10) return 10;
  if (radius <= 15) return 9;
  if (radius <= 20) return 9;
  if (radius <= 50) return 7;
  return 6;
}

export const GeoPicker: React.FC<GeoPickerProps> = ({ form, retrievedGeo }) => {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState<LatLng>(
    new LatLng(37.828724, -122.355537)
  );
  const geolocation = useGeolocation();

  const onMove = useCallback(() => {
    if (!map) return;
    // @ts-ignore
    setPosition(map.getCenter());
  }, [map]);

  useEffect(() => {
    if (!map) return;
    // @ts-ignore
    map.on("move", onMove);
    // @ts-ignore
    map.attributionControl.setPrefix("")
    return () => {
      if (map) {
        // @ts-ignore
        map.off("move", onMove)
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!map) return;
    // @ts-ignore
    map.panTo(position)
  }, [position])

  useEffect(() => {
    if (!retrievedGeo) return
    setPosition(new LatLng(retrievedGeo[0], retrievedGeo[1]))
  }, [retrievedGeo])

  const displayMap = useMemo(() => {
    return (
      <MapContainer
        // @ts-ignore
        ref={setMap}
        center={position}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-96 z-0"
        dragging={false}

      >
        <ScaleControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon} />
        {
          form.watch("location_zip.radius") && (
            <Circle center={position} radius={form.watch("location_zip.radius") * 1609.34} />
          )
        }
        {/* <AttributionControl prefix="" /> */}
      </MapContainer>
    );
  }, [position, onMove]);

  const handleSetZip = async (value: number) => {
    const functionRef = httpsCallable(functions, "get_location_from_zip");
    let response: ZipToLocation;

    try {
      response = (await functionRef({ zip: value })).data as ZipToLocation;
      if (response) {
        setPosition(new LatLng(
          response.lat,
          response.lng
        ))
      }
    } catch (error) {
      console.error("Error getting location from zip", error)
      form.setError("location_zip.zip", {
        type: "manual",
        message: "Invalid zip code"
      })
    }
  }

  const handleUseLocation = async () => {
    if (geolocation.error) {
      toast({
        title: "Error",
        description: "Error getting location",
      })
      return
    }

    try {
      if (geolocation.latitude && geolocation.longitude) {
        let response = (await httpsCallable(functions, "get_zip_from_location")({
          lat: geolocation.latitude,
          lng: geolocation.longitude,
        })).data as ZipToLocation;
        if (response) {
          setPosition(new LatLng(
            response.lat,
            response.lng
          ))
          form.setValue("location_zip.zip", response.zip)
          form.setValue("location_zip.lat", response.lat);
          form.setValue("location_zip.lng", response.lng);
        }
        toast({
          title: "Success",
          description: `Location set to the nearest zip code ${response.zip}`
        })
      }
    } catch (error) {
      console.error("Error getting location", error)
      toast({
        title: "Error",
        description: "Unable to get the zip code from your location",
      })
    }
  }

  return (
    <FormField
      control={form.control}
      name="location_zip"
      render={({ field }) => (
        <FormItem>
          <FormDescription>
            Realtors will be able to find you if you are close enough to them
          </FormDescription>
          {displayMap}
          <FormField
            control={form.control}
            name="location_zip.zip"
            render={({ field: subfield }) => (
              <FormItem>
                <FormItem className="flex flex-row space-y-0 gap-2">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your zip code"
                      value={subfield?.value || ""}
                      onChange={subfield.onChange}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="default"
                    className="flex justify-between items-center"
                    disabled={!subfield || subfield.value?.toString()?.length < 3}
                    onClick={() => handleSetZip(subfield.value)}
                  >
                    Set zip
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex justify-between items-center"
                    onClick={handleUseLocation}
                  >
                    Use my location
                  </Button>
                </FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="location_zip.radius"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={(value) => {
                  field.onChange(value)
                  if (!map) return
                  // @ts-ignore
                  map.setZoom(getZoom(parseInt(value)))
                }}

                  value={field?.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select radius" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="5">5 miles</SelectItem>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="20">20 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                    <SelectItem value="500">500 miles</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormDescription>
            {`Latitude: ${position.lat.toFixed(
              6
            )}, Longitude: ${position.lng.toFixed(6)}`}
          </FormDescription>
        </FormItem>
      )}
    />
  );
};
