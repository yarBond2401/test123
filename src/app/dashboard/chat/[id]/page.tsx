// @ts-nocheck
"use client";

import { format, set, sub } from "date-fns";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { useIsVendor } from "@/hooks/useIsVendor";
import { cn, formatChatMessageTime } from "@/lib/utils";

import { CurrentChatContext, UserContext } from "../utils";

import PaperclipIcon from "@/icons/icon=paperclip.svg";
import SmileIcon from "@/icons/icon=smile.svg";
import SendIcon from "@/icons/icon=send.svg";
import MoreIcon from "@/icons/icon=more.svg";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRequest } from "@/components/RequestContext";
import { Dialog } from "@radix-ui/react-dialog";
import ServiceDetailsDialog from "./components/ServiceDetailsDialog";
import SendOfferDialog from "./components/SendOfferDialog";
import { toast } from "@/components/ui/use-toast";
import { useOfferDetails } from "@/hooks/useOfferDetails";

interface Props {
  params: {
    id: string;
  };
}

interface OfferDetails {
  hideSendOffer: boolean;
  showAcceptButton: boolean;
  showViewDetailsButton: boolean;
}

interface VendorData {
  requestId?: string;
  vendorId?: string;
  services: any[];
}


const ChatItem = ({ data, chatDetails }) => {
  const user = useContext(UserContext);
  const [status, setStatus] = useState("");
  let id = null;

  const isSender = useMemo(
    () => user?.uid === data.sender,
    [user, data.sender]
  );

  const { openDialog } = useOfferDetails();

  useEffect(() => {
    if (data?.offerId) {
      getDoc(doc(db, "offers", data?.offerId)).then((doc) => {
        setStatus(doc.data()?.status || "unknown");
      });
    }
  }, [data?.offerId]);

  if (!user) return null;

  const handleAccept = async () => {
    if (!id) return;
    let docRef = doc(db, "offers", id);
    await updateDoc(docRef, { status: "accepted", acceptedAt: serverTimestamp() });
    toast({
      title: "Success",
      description: "Offer accepted",
      type: "success",
    });
    setStatus("accepted");
  };

  return (
    <div className="flex flex-col justify-start gap-2">
      {(!isSender && chatDetails?.userDetails) && (
        <div className="flex flex-col">
          <p className="text-sm leading-5 text-[#637381] self-start">{chatDetails.userDetails.displayName}</p>
        </div>
      )}
      <div className={cn(
        "flex flex-col px-5 py-3",
        isSender
          ? "self-end items-end bg-[#5296BF] text-white rounded-t-2xl rounded-bl-2xl"
          : "self-start items-start bg-gray-100 text-dashboard-main rounded-b-2xl rounded-tr-2xl"
      )}>
        <p className="text-lg font-normal">{data.text}</p>
        {id && status === "pending" && !isSender && (
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              className="bg-[#52BF56] hover:bg-green-600 text-white"
              onClick={handleAccept}
            >
              Accept offer
            </Button>
          </div>
        )}
        <Button
          type="button"
          onClick={() => openDialog(data.offerId)}
        >
          View details
        </Button>
      </div>
      <p className={cn("text-xs leading-5 text-[#637381]", isSender ? "self-end" : "self-start")}>
        {data.time ? formatChatMessageTime(data.time.toDate()) : "Sending..."}
      </p>
    </div >
  );
};

const ChatTab: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useContext(UserContext);
  const chatDetails = useContext(CurrentChatContext);
  const chatId = useMemo(() => params.id, [params.id]);
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useChat({ chatId, user });
  const isVendor = useIsVendor(user);
  const { requestId } = useRequest();

  const [hydrated, setHydrated] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [offerDetails, setOfferDetails] = useState<OfferDetails>({ hideSendOffer: true, showAcceptButton: false, showViewDetailsButton: false });

  const acceptTheContract = async () => {
    if (!vendorData) return;

    const services = vendorData?.services?.map(service => ({
      ...service,
      offerStatus: 'accepted'
    }));

    try {
      const vendorDocRef = doc(db, `requests/${vendorData.requestId}/selectedVendors/${vendorData.vendorId}`);
      await updateDoc(vendorDocRef, { services });
      console.log("Services updated to accepted");
    } catch (error) {
      console.error("Error updating services: ", error);
    }
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  const submitOffer = () => {
    if (isVendor) return;
    router.push(`/dashboard/requests/${requestId}`);
  }

  useEffect(() => {
    console.log('chatDetails', chatDetails);
  }, [chatDetails]);

  // useEffect(() => {
  //   const getOfferDetails = async () => {
  //     console.log("Checking if user is a vendor:", isVendor);

  //     const requestsRef = collection(db, "requests");
  //     const querySnapshot = await getDocs(requestsRef);
  //     console.log("Fetched requests:", querySnapshot.docs.map((doc) => doc.id));

  //     if (isVendor) {
  //       let hideSendOffer = false;

  //       for (const requestDoc of querySnapshot.docs) {
  //         const selectedVendorsRef = collection(
  //           db,
  //           `requests/${requestDoc.id}/selectedVendors`
  //         );
  //         const q = query(
  //           selectedVendorsRef,
  //           where("vendorId", "==", user?.uid)
  //         );
  //         const vendorDocs = await getDocs(q);

  //         vendorDocs.forEach((doc) => {
  //           const vendorData = doc.data();
  //           console.log("Vendor Document ID:", doc.id, "Vendor Data:", vendorData);
  //           if (vendorData.vendorId === user?.uid) {
  //             setVendorData(vendorData);
  //             hideSendOffer = true;
  //           }
  //         });

  //         if (hideSendOffer) break;
  //       }

  //       console.log("Hide Send Offer:", hideSendOffer);
  //       return { hideSendOffer };
  //     } else {
  //       let showAcceptButton = false;
  //       let showViewDetailsButton = false;

  //       for (const requestDoc of querySnapshot.docs) {
  //         const selectedVendorsRef = collection(
  //           db,
  //           `requests/${requestDoc.id}/selectedVendors`
  //         );
  //         const q = query(
  //           selectedVendorsRef,
  //           where("brokerId", "==", user?.uid)
  //         );
  //         const agentDocs = await getDocs(q);

  //         agentDocs.forEach((doc) => {
  //           const docData = doc.data();
  //           console.log("Agent Document Data:", docData);
  //           if (docData.agentId === user?.uid) {
  //             showAcceptButton = true;
  //           }
  //         });

  //         if (showAcceptButton) {
  //           const requestData = requestDoc.data();
  //           console.log("Request Data:", requestData);

  //           const userService = requestData.services.find(
  //             (service) => service.selected === user?.uid
  //           );
  //           console.log("User Service:", userService);

  //           if (userService && userService.offerStatus === "pending") {
  //             showViewDetailsButton = true;
  //           }
  //         }

  //         if (showAcceptButton || showViewDetailsButton) break;
  //       }

  //       return { showAcceptButton, showViewDetailsButton };
  //     }
  //   };

  //   if (user?.uid) {
  //     getOfferDetails().then(offerDetails => {
  //       setOfferDetails(offerDetails);
  //       console.log("Offer Details:", offerDetails);
  //     });
  //   }
  // }, [isVendor, user?.uid]);

  return (
    <Card
      className={cn(
        "col-span-1 xl:col-span-2 flex-col overflow-hidden max-w-full",
        pathname === "/dashboard/chat" ? "hidden md:flex" : "flex"
      )}
    >
      <div className="flex justify-between p-6 pt-5 items-center">
        <div className="flex h-full items-center">
          <div className="relative 2xl:h-11 2xl:w-11 md:h-8 md:w-8 h-11 w-11 shrink-0">
            {chatDetails?.userDetails ? (
              <>
                <Image
                  src={chatDetails.userDetails.photoURL || defaultAvatar}
                  alt={chatDetails.userDetails.displayName}
                  className="w-full h-auto rounded-full"
                  width={44}
                  height={44}
                />
                <div
                  className={cn(
                    chatDetails.userDetails.online ? "bg-green-400" : "bg-red-500",
                    "2xl:w-3 2xl:h-3 md:w-2 md:h-2 w-3 h-3 rounded-full 2xl:border-[2px] md:border border-[2px] border-white absolute bottom-0 right-0 box-border"
                  )}
                />
              </>
            ) : (
              <Skeleton className="w-10 h-10 rounded-full" />
            )}
          </div>

          <div className="flex flex-col ml-4">
            {chatDetails?.userDetails ? (
              <p className="font-medium text-lg leading-6 text-dashboard-main">{chatDetails.userDetails.displayName}</p>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            <p className="font-normal text-sm text-dashboard-secondary">Reply to message</p>
          </div>
        </div>

        {(chatDetails?.userDetails?.email !== "info@mrkit.io") && <div className="flex flex-row gap-3 items-center">

          {!isVendor && chatDetails && (
            <SendOfferDialog vendorId={chatDetails?.vendor} agentId={chatDetails?.agent} />
          )}

        </div>}
        <Button
          type="button"
          className="md:hidden"
          onClick={() => router.push("/dashboard/chat")}
        >
          Back
        </Button>
      </div>
      <Separator />
      <div className="flex flex-1 overflow-y-scroll py-6">
        <div className="min-w-full min-h-full flex flex-col-reverse px-7 py-4 gap-8 justify-end">
          {messages.length !== 0
            ? messages.map((message: any) => (
              <ChatItem
                key={message.id}
                data={message}
                chatDetails={chatDetails}
              />
            ))
            : null}
        </div>
      </div>
      <Separator />
      <form
        className="flex items-center gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();

          if (!message.trim().length) {
            return;
          }
          sendMessage(message);
          setMessage("");
        }}
      >
        <div className="bg-gray-100 border border-[#DFE4EA] w-full flex flex-row gap-3 px-5 py-3 rounded-md">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something here..."
            autoFocus={true}
            className="outline-none text-base leading-[22px] font-normal placeholder:text-[#8899A8] bg-gray-100 w-full"
          />
          <button>
            <Image
              src={PaperclipIcon}
              alt="add a file"
              height={18}
              width={18}
            />
          </button>
          <button>
            <Image src={SmileIcon} alt="add an emoji" height={18} width={18} />
          </button>
        </div>
        <button
          type="submit"
          className="p-[14px] bg-[#5352BF] rounded-md hover:bg-[#1B44C8]"
        >
          <Image src={SendIcon} alt="send" height={20} width={20} />
        </button>
      </form>
    </Card>
  );
};

export default ChatTab;