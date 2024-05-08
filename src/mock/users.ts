import { User } from "./types";
import vendorPhoto from "@/images/mock/vendor.jpg";
import agentPhoto from "@/images/mock/agent.jpg";

export const vendor: User = {
  name: "John Strassmann",
  role: "vendor",
  photo: vendorPhoto,
  level: "New Seller",
  success: 100,
  rating: 5,
  response: 80, 
  totalMoney: "$12.500",
  totalMoneyInt: "12.0",
  totalWork: "62",
  totalWorkInt: "1.0",
  totalHours: "250",
  totalHoursInt: "0.43",
  monthlyAmount: "700",
  annualAmount: "7.500",
}

export const agent: User = {
  name: "Carlos Andrez",
  role: "agent",
  photo: agentPhoto,
  level: "Old Buyer",
  success: 86,
  rating: 4.7,
  response: 100, 
  totalMoney: "$56.500",
  totalMoneyInt: "12.0",
  totalWork: "124",
  totalWorkInt: "0.0",
  totalHours: "640",
  totalHoursInt: "0.43",
  monthlyAmount: "600",
  annualAmount: "23.200",
}