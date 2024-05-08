import { StaticImageData } from "next/image";

export interface InboxItemType {
  photo: StaticImageData,
  name: string,
  massage: string,
  online: boolean
}

export interface DealPartner {
  avatar: StaticImageData,
  name: string,
  mail: string,
}

export interface DealType {
  id: string,
  partner: DealPartner,
  deal: string,
  date: string,
  isCompleted: boolean,
  income: number,
}

export interface User {
  name: string,
  role: "vendor" | "agent",
  photo: StaticImageData,
  level: string,
  success: number,
  rating: number,
  response: number,
  totalMoney: string, 
  totalMoneyInt: string,
  totalWork: string,
  totalWorkInt: string,
  totalHours: string,
  totalHoursInt: string,
  monthlyAmount: string,
  annualAmount: string,
}
