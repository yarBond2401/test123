// @ts-nocheck

import { User } from "firebase/auth";
import { collection, doc, setDoc, getDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import { pick } from "remeda";
import { format } from "date-fns";
import { LocationMode } from "../types";
import { toast } from "@/components/ui/use-toast";
import { serviceOffer } from "../schema";

const transformPortfolio = (serviceDetails: any) => {
  return Object.entries(serviceDetails).reduce((acc, [key, value]) => {
    if (value.portfolio === undefined) {
      value.portfolio = "";
    }
    acc[key] = value;
    return acc;
  }, {});
};

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
    acc[key].closed = value.closed ? true : false;
    return acc;
  }, {} as Record<string, any>);

  let locationWithType: Record<string, any> = {};
  if (locationMode === "regional") {
    locationWithType["locations"] = data.locations;
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
    // Use setDoc with merge option to update or create the document
    await setDoc(docRef, newData, { merge: true });

    const transformedServiceDetails = transformPortfolio(data.serviceDetails);

    // Get all existing services
    const existingServicesSnapshot = await getDocs(servicesRef);
    const existingServices = new Set(existingServicesSnapshot.docs.map(doc => doc.id));

    console.log("Existing services", existingServices);

    let promises = Object.entries(transformedServiceDetails).map(async ([key, value]) => {
      console.log("Updating service", key);
      let subcolRef = doc(servicesRef, key);
      const updatedServiceData = {
        vendorId: user.uid,
        type: key,
        ...value,
        ...locationWithType,
      };
      console.log("updatedServiceData", updatedServiceData);
      // Use setDoc with merge option for services
      existingServices.delete(key); // Remove from set as it's being updated
      return setDoc(subcolRef, updatedServiceData, { merge: true });
    });
    console.log("existingServices", existingServices);

    // Delete services that are no longer present
    existingServices.forEach(serviceId => {
      console.log("Deleting service", serviceId);
      promises.push(deleteDoc(doc(servicesRef, serviceId)));
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