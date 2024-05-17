import firstAvatar from "@/images/mock/agent.jpg";
import secondAvatar from "@/images/mock/Avatar-2.jpg";
import thirdAvatar from "@/images/mock/Avatar-3.jpg";
import { SuperRequest } from "./types";

export const superRequests: SuperRequest[] = [
  {
    id: "01",
    createdBy: "Carlos Andrez",
    photo: firstAvatar,
    email: "test@gmail.com",
    date: "06/05/2024",
    notes: "Notes",
    status: "Installed",
  },
  {
    id: "02",
    createdBy: "Cody Fisher",
    photo: secondAvatar,
    date: "18/04/2024",
    email: "test@gmail.com",
    notes: "Notes",
    status: "Resolved",
  },
  {
    id: "01",
    createdBy: "Esther Howard",
    photo: thirdAvatar,
    date: "12/04/2024",
    email: "test@gmail.com",
    notes: "Notes",
    status: "Issued",
  },
]