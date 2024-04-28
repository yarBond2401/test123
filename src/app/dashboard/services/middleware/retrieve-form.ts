import { parse } from "date-fns";

import { LocationMode, ServiceInDBWithSubcollections } from "../types";
import { serviceOffer } from "../schema";
import { omit, pick } from "remeda";
import { OFFERED_SERVICES } from "@/app/constants";

export const retrieveForm = (data: ServiceInDBWithSubcollections) => {
  let newData: Record<string, any> = {};

  newData["description"] = data.description;
  newData["generic_availability"] = Object.entries(
    data.generic_availability
  ).reduce((acc, [key, value]) => {
    acc[key] = {};
    acc[key].open = parse(
      value.open.toString().padStart(4, "0"),
      "Hmm",
      new Date()
    );
    acc[key].close = parse(
      value.close.toString().padStart(4, "0"),
      "Hmm",
      new Date()
    );
    acc[key].closed = value.closed;
    return acc;
  }, {} as Record<string, any>);

  if (data.locations) {
    newData["locations"] = data.locations;
    newData["locationMode"] = "regional";
  } else if (data.location_zip) {
    newData["location_zip"] = pick(data.location_zip, ["zip", "radius"]);
    newData["locationMode"] = "geolocation";
  } else if (data.location_nationwide) {
    newData["locationMode"] = "nationwide";
    newData["location_nationwide"] = true;
  }

  newData["serviceSelect"] = OFFERED_SERVICES.reduce((acc, service) => {
    if (data.services.find((s) => s.id === service.id)) {
      acc[service.id] = true;
    } else {
      acc[service.id] = false;
    }
    return acc;
  }, {} as Record<string, boolean>);

  newData["serviceDetails"] = data.services.reduce((acc, service) => {
    acc[service.id] = omit(service, ["id", "type"]);
    return acc;
  }, {} as Record<string, any>);

  return newData as serviceOffer & { locationMode: LocationMode };
};
