import { User } from "firebase/auth";
import { collection, doc, updateDoc, setDoc } from "firebase/firestore";
import { serviceOffer } from "../schema";
import { db } from "@/app/firebase";
import { pick } from "remeda";
import { format } from "date-fns";
import { LocationMode } from "../types";
import { toast } from "@/components/ui/use-toast";

export const submitForm = async (
  data: serviceOffer,
  user: User,
  locationMode: LocationMode
) => {
  let newData: Record<string, any> = {};

  // Data transformation
  newData = pick(data, ["description"]);
  newData["generic_availability"] = Object.entries(
    data.generic_availability
  ).reduce((acc, [key, value]) => {
    acc[key] = {};
    acc[key].open = parseInt(format(value.open, "HHmm"));
    acc[key].close = parseInt(format(value.close, "HHmm"));
    if (value.closed) {
      acc[key].closed = true;
    } else {
      acc[key].closed = false;
    }

    return acc;
  }, {} as Record<string, any>);

  let locationWithType: Record<string, any> = {};

  if (locationMode === "regional") {
    locationWithType["locations"] = data.locations;
    // @ts-ignore
    locationWithType["locations_queriable"] = data.locations.map(
      (loc) => `${loc.type}-${loc.name.replaceAll(" ", "_")}`
    );
  } else if (locationMode === "geolocation") {
    locationWithType["location_zip"] = data.location_zip;
  } else if (locationMode === "nationwide") {
    locationWithType["location_nationwide"] = true;
  }

  newData = {
    ...newData,
    ...locationWithType,
  };

  let docRef = doc(db, "vendors", user.uid);
  let servicesRef = collection(db, "vendors", user.uid, "services");

  // Submit to firestore
  try {
    await setDoc(docRef, newData);
    let promises = Object.entries(data.serviceDetails).map(([key, value]) => {
      let subcolRef = doc(servicesRef, key);
      setDoc(subcolRef, {
        vendorId: user.uid,
        type: key,
        ...value,
        ...locationWithType,
      });
    });
    await Promise.all(promises);
    toast({
      title: "Update success",
      description: "Your vendor profile has been updated",
    });
  } catch (error) {
    console.error(error);
  }
};
