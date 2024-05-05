import { InboxItemType } from "./types";
import firstAvatar from "@/images/mock/image-1.jpg";
import secondAvatar from "@/images/mock/image-2.jpg";
import thirdAvatar from "@/images/mock/image-3.jpg";
import fourthAvatar from "@/images/mock/image-4.jpg";

export const inboxItems: InboxItemType[] = [
  {
    photo: firstAvatar,
    name: "Devid Heilo",
    massage: "I cam across your profile and...",
    online: true,
  },
  {
    photo: secondAvatar,
    name: "Henry Fisher",
    massage: "I like your confidence 💪 ",
    online: true,
  },
  {
    photo: thirdAvatar,
    name: "Wilium Smith",
    massage: "Can you share your offer?",
    online: true,
  },
  {
    photo: fourthAvatar,
    name: "Henry Deco",
    massage: "I’m waiting for you response!",
    online: false,
  },
];