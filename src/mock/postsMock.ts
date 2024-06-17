import firstAvatar from "@/images/mock/agent.jpg";
import secondAvatar from "@/images/mock/Avatar-2.jpg";
import thirdAvatar from "@/images/mock/Avatar-3.jpg";
import { Post } from "../lib/types";

export const posts: Post[] = [
  {
    id: "01",
    createdBy: "Carlos Andrez",
    photo: firstAvatar,
    date: "06/05/2024",
    services: [
      {
        name: "Photographer",
        duration: 1,
      },
      {
        name: "Videographer",
        duration: 1,
      },
    ],
    serviceNumber: 2,
    subtotal: 250,
    tax: 250,
  },
  {
    id: "02",
    createdBy: "Cody Fisher",
    photo: secondAvatar,
    date: "18/04/2024",
    services: [
      {
        name: "Drone Photographer",
        duration: 1,
      },
      {
        name: "Photographer",
        duration: 1,
      },
    ],
    serviceNumber: 2,
    subtotal: 350,
    tax: 350,
  },
  {
    id: "03",
    createdBy: "Esther Howard",
    photo: thirdAvatar,
    date: "12/04/2024",
    services: [
      {
        name: "Home Stager",
        duration: 3,
      },
    ],
    serviceNumber: 1,
    subtotal: 150,
    tax: 150,
  },
]