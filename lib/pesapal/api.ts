const PESAPAL_API_URL = process.env.PESAPAL_API_URL || "https://pay.pesapal.com/v3";

interface AuthResponse {
  token: string;
  expiry: string;
}

interface IPNRegistrationResponse {
  url: string;
  ipn_id: string;
}

interface SubmitOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error: null | string;
  status: string;
}

interface TransactionStatusResponse {
  payment_status: string;
  payment_method: string;
  amount: number;
  currency: string;
  confirmation_code: string | null;
  payment_status_description: string;
  description: string | null;
  message: string;
  merchant_reference: string;
}

export async function getAuthToken(): Promise<string> {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("PesaPal credentials not configured");
  }

  const response = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`PesaPal auth failed: ${response.status}`);
  }

  const data: AuthResponse = await response.json();
  return data.token;
}

export async function registerIPN(url: string, token: string): Promise<IPNRegistrationResponse> {
  const response = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      ipn_notification_type: "GET",
    }),
  });

  if (!response.ok) {
    throw new Error(`IPN registration failed: ${response.status}`);
  }

  return response.json();
}

export interface OrderPayload {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

export async function submitOrder(payload: OrderPayload, token: string): Promise<SubmitOrderResponse> {
  const response = await fetch(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Order submission failed: ${response.status}`);
  }

  return response.json();
}

export async function getTransactionStatus(orderTrackingId: string, token: string): Promise<TransactionStatusResponse> {
  const response = await fetch(
    `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Transaction status check failed: ${response.status}`);
  }

  return response.json();
}
