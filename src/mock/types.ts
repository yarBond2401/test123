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

export interface Vendor {
  name: string,
  role: "vendor",
  photo: StaticImageData,
  level: string,
  success: number,
  postsAvailable?: number,
  postsInstalled?: number,
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

export interface Agent {
  name: string,
  role: "agent",
  photo: StaticImageData,
  level: string,
  postsAvailable: number,
  postsInstalled: number,
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

interface Service {
  name: string;
  duration: number;
}

export interface Post {
  id: string;
  createdBy: string;
  photo: StaticImageData; 
  date: string;
  services: Service[];
  serviceNumber: number;
  subtotal: number;
  tax: number;
}

export interface SuperRequest {
  id: string;
  createdBy: string;
  photo: StaticImageData;
  email: string;
  date: string; 
  notes: string;
  status: string;
}