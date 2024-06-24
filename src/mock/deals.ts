import { subDays } from "date-fns";

// Function to generate random Firestore-like timestamps within the last year
const randomDateLastYear = () => {
  const end = new Date();
  const start = subDays(end, 365);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  // Mimic Firestore Timestamp format
  return {
    seconds: Math.floor(randomDate.getTime() / 1000),
    nanoseconds: 0,
    toDate() {
      return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
    },
  };
};

// Mock data
export const mockDeals = [
  {
    id: 1,
    otherUserDetails: {
      photoURL: "/images/mock/Avatar-2.jpg",
      displayName: "John Doe",
      email: "john.doe@example.com",
    },
    offerDate: randomDateLastYear(),
    status: "pending",
    vendorСosts: 500,
    withoutTax: 450,
  },
  {
    id: 2,
    otherUserDetails: {
      photoURL: "/images/mock/Avatar-1.jpg",
      displayName: "Jane Smith",
      email: "jane.smith@example.com",
    },
    offerDate: randomDateLastYear(),
    status: "accepted",
    vendorСosts: 600,
    withoutTax: 550,
  },
  {
    id: 3,
    otherUserDetails: {
      photoURL: "/images/mock/Avatar-3.jpg",
      displayName: "Alice Johnson",
      email: "alice.johnson@example.com",
    },
    offerDate: randomDateLastYear(),
    status: "rejected",
    vendorСosts: 700,
    withoutTax: 650,
  },
  {
    id: 4,
    otherUserDetails: {
      photoURL: "/images/mock/Avatar-2.jpg",
      displayName: "Bob Brown",
      email: "bob.brown@example.com",
    },
    offerDate: randomDateLastYear(),
    status: "completed",
    vendorСosts: 800,
    withoutTax: 750,
  },
  {
    id: 5,
    otherUserDetails: {
      photoURL: "/images/mock/Avatar-1.jpg",
      displayName: "Charlie Davis",
      email: "charlie.davis@example.com",
    },
    offerDate: randomDateLastYear(),
    status: "pending",
    vendorСosts: 900,
    withoutTax: 850,
  },
];
