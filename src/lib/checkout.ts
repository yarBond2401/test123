import { API_BASE_URL } from '@/app/constants';
import axios from 'axios';

interface CheckoutSessionInput {
  id: string;
  userId: string;
  email: string;
  region: string;
  plan: string;
  isNewUser?: boolean;
}

interface ConnectCheckoutSessionInput {
    amount: number;
    currency: string;
    vendorStripeAccountId: string;
    customerEmail: string;
    metadata: {
        offerId: string;
        vendorId: string;
        customerId: string;
    };
}

export const createConnectCheckoutSession = async (input: ConnectCheckoutSessionInput) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-connect-checkout-session`, input);

        const data = response.data;

        localStorage.setItem("checkoutSessionId", data.session.id);
        localStorage.setItem("offerId", input.metadata.offerId);
        localStorage.setItem("vendorId", input.metadata.vendorId);
        localStorage.setItem("amount", input.amount.toString());
        localStorage.setItem("currency", input.currency);
        localStorage.setItem("vendorStripeAccountId", input.vendorStripeAccountId);
        localStorage.setItem("isConnectPayment", "true");

        return data;
    } catch (error) {
        console.error('Error creating connect checkout session:', error);
        throw error;
    }
};

export const createCheckoutSession = async (input: CheckoutSessionInput) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-checkout-session`, input);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    localStorage.setItem("checkoutSessionId", data.session.id);
    localStorage.setItem("userId", input.userId);
    localStorage.setItem("userEmail", input.email);
    localStorage.setItem("pricingRegion", input.region);
    localStorage.setItem("pricingModel", input.plan);
    localStorage.setItem("isNewUser", input?.isNewUser ? "true" : "false");

    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const checkPaymentStatus = async (sessionId: string) => {
  try {
    console.log(`Checking payment status for session id: ${sessionId}`);
    
    const response = await axios.get(`${API_BASE_URL}/session-status`, {
      params: { session_id: sessionId }
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    console.log(`Payment status data: ${JSON.stringify(data)}`);
    
    return data.status;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};