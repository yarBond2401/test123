import { User } from "firebase/auth";
import { collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { pick } from "remeda";
import { format } from "date-fns";
import { LocationMode } from "../types";
import { toast } from "@/components/ui/use-toast";
import { serviceOffer } from "../schema";

export const submitForm = async (
  data: serviceOffer,
  user: User,
  locationMode: LocationMode,
  callback: () => void
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

  try {
  const docSnap = await getDoc(docRef);
  const currentData = docSnap.data() || {};

  const updatedData = { ...currentData, ...newData };

  // Update the document with merged data
  await updateDoc(docRef, updatedData);

  let promises = Object.entries(data.serviceDetails).map(async ([key, value]) => {
    let subcolRef = doc(servicesRef, key);
    const serviceSnap = await getDoc(subcolRef);
    const currentServiceData = serviceSnap.data() || {};
    const updatedServiceData = {
      ...currentServiceData,
      vendorId: user.uid,
      type: key,
      ...value,
      ...locationWithType,
    };
    return updateDoc(subcolRef, updatedServiceData);
  });
  await Promise.all(promises);

  toast({
    toastType: "success",
    title: "Update success",
    description: "Your vendor profile has been updated",
  });
} catch (error) {
  console.error(error);
  toast({
    toastType: "error",
    title: "Update failed",
    description: "An error occurred while updating your profile",
  });
} finally {
  callback();
}
};
