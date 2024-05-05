import { DealPartner, DealType } from "./types";
import firstAvatar from "@/images/mock/Avatar-1.jpg";
import secondAvatar from "@/images/mock/Avatar-2.jpg";
import thirdAvatar from "@/images/mock/Avatar-3.jpg";

const partnersMock: DealPartner[] = [
  {
    avatar: firstAvatar,
    name: "Jane Cooper",
    mail: "jane.cooper@example.com",
  },
  {
    avatar: secondAvatar,
    name: "Cody Fisher",
    mail: "cody.fisher@example.com",
  },
  {
    avatar: thirdAvatar,
    name: "Esther Howard",
    mail: "esther.howard@example.com",
  },
];

export const dealsMock: DealType[] = [
  {
    id: "01",
    partner: partnersMock[0],
    deal: "Real estate photo shoot",
    date: "20/04/2024",
    isCompleted: true,
    income: 150,
  },
  {
    id: "02",
    partner: partnersMock[1],
    deal: "Real estate photo shoot",
    date: "15/04/2024",
    isCompleted: true,
    income: 400,
  },
  {
    id: "03",
    partner: partnersMock[2],
    deal: "Real estate photo shoot",
    date: "08/02/2024",
    isCompleted: true,
    income: 200,
  },
  {
    id: "04",
    partner: partnersMock[0],
    deal: "Real estate photo shoot",
    date: "12/01/2024",
    isCompleted: true,
    income: 300,
  },
];