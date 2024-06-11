import { Vendor, Agent } from "./types";
import vendorPhoto from "@/images/mock/vendor.jpg";
import agentPhoto from "@/images/mock/agent.jpg";

export const vendor: Vendor = {
  name: "John Strassmann",
  role: "vendor",
  photo: vendorPhoto,
  level: "New Seller",
  success: 100,
  rating: 5,
  response: '80',
  totalMoney: 12500,
  totalMoneyInt: 12.0,
  totalWork: 62,
  totalWorkInt: 1.0,
  totalHours: 250,
  totalHoursInt: 0.43,
  monthlyAmount: 700,
  annualAmount: 7500,
}

export const agent: Agent = {
  name: "Carlos Andrez",
  role: "agent",
  photo: agentPhoto,
  level: "Old Buyer",
  availablePosts: 40,
  postsInstalled: 3,
  rating: 4.7,
  response: '100',
  totalMoney: 56500,
  totalMoneyInt: 12.0,
  totalWork: 124,
  totalWorkInt: 0.0,
  totalHours: 640,
  totalHoursInt: 0.43,
  monthlyAmount: 600,
  annualAmount: 23200,
}