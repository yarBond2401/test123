export type Inputs = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: "vendor" | "agent";
};


export type FormScreen = "user-type" | "user-details" | "agent-pricing" | "vendor-pricing";