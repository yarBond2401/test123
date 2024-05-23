import { ChatItem } from "./types";
import firstAvatar from "@/images/mock/image-1.jpg";
import secondAvatar from "@/images/mock/image-2.jpg";
import thirdAvatar from "@/images/mock/image-3.jpg";
import fourthAvatar from "@/images/mock/image-4.jpg";

export const inboxItems: ChatItem[] = [
  {
    id: "01",
    userDetails: {
      photo: firstAvatar,
      name: "Devid Heilo",
      online: true,
    },
    lastMessage: "I cam across your profile and...",
  },
  {
    id: "02",
    userDetails: {
      photo: secondAvatar,
      name: "Henry Fisher",
      online: true,
    },
    lastMessage: "I like your confidence 💪",
  },
  {
    id: "03",
    userDetails: {
      photo: thirdAvatar,
      name: "Wilium Smith",
      online: true,
    },
    lastMessage: "Can you share your offer?",
  },
  {
    id: "04",
    userDetails: {
      photo: fourthAvatar,
      name: "Henry Deco",
      online: false,
    },
    lastMessage: "I’m waiting for you response!",
  },
];
