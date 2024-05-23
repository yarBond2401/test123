import { ChatItem } from "./types";
import firstAvatar from "@/images/mock/image-1.jpg";
import secondAvatar from "@/images/mock/image-2.jpg";
import thirdAvatar from "@/images/mock/image-3.jpg";
import fourthAvatar from "@/images/mock/image-4.jpg";

export const inboxItems: ChatItem[] = [
  {
    id: "01",
    userDetails: {
      photoURL: firstAvatar,
      displayName: "Devid Heilo",
      email: "test@gmail.com",
      uid: "010",
      online: true,
    },
    last_text: "I cam across your profile and...",
    last_sender: "010",
    last_time: "10/02/2024",
    agent: "010",
    vendor: "020",
  },
  {
    id: "02",
    userDetails: {
      photoURL: secondAvatar,
      displayName: "Henry Fisher",
      email: "test@gmail.com",
      uid: "030",
      online: true,
    },
    last_text: "I like your confidence 💪",
    last_sender: "010",
    last_time: "10/02/2024",
    agent: "010",
    vendor: "030",
  },
  {
    id: "03",
    userDetails: {
      photoURL: thirdAvatar,
      displayName: "Wilium Smith",
      email: "test@gmail.com",
      uid: "050",
      online: true,
    },
    last_text: "Can you share your offer?",
    last_sender: "010",
    last_time: "10/02/2024",
    agent: "010",
    vendor: "050",
  },
  {
    id: "04",
    userDetails: {
      photoURL: fourthAvatar,
      displayName: "Henry Deco",
      email: "test@gmail.com",
      uid: "040",
      online: false,
    },
    last_text: "I’m waiting for you response!",
    last_sender: "010",
    last_time: "10/02/2024",
    agent: "010",
    vendor: "040",
  },
];
