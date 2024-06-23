interface CheckoutSessionInput {
  id: string;
  userId: string;
  email: string;
  region: string;
  plan: string;
  isNewUser?: boolean;
}

export const createCheckoutSession = async (input: CheckoutSessionInput) => {
  try {
    const response = await fetch('https://us-central1-mkr-it.cloudfunctions.net/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify({ ...input }),
    });

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
    
    const response = await fetch(`https://us-central1-mkr-it.cloudfunctions.net/api/session-status?session_id=${sessionId}`);
    
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