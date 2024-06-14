import { StaticImageData } from "next/image";

interface ChatUser {
  photoURL: StaticImageData,
  displayName: string,
  email: string,
  uid: string,
  online: boolean
}

export interface ChatItem {
  id: string,
  userDetails: ChatUser,
  agent: string,
  vendor: string,
  last_text: string,
  last_sender: string,
  last_time: string,
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
  availablePosts?: number,
  postsInstalled?: number,
  totalRating: number,
  totalReviews: number,
  response: number,
  totalMoney: number,
  totalMoneyInt: number,
  totalWork: number,
  totalWorkInt: number,
  totalHours: number,
  totalHoursInt: number,
  monthlyAmount: number,
  annualAmount: number,
}

export interface Agent {
  name: string,
  role: "agent",
  photo: StaticImageData,
  level: string,
  availablePosts: number,
  postsInstalled: number,
  totalRating: number,
  totalReviews: number,
  response: number,
  totalMoney: number,
  totalMoneyInt: number,
  totalWork: number,
  totalWorkInt: number,
  totalHours: number,
  totalHoursInt: number,
  monthlyAmount: number,
  annualAmount: number,
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