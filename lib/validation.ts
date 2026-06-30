import { z } from "zod";

// PesaPal Callback Validation
export const pesapalCallbackSchema = z.object({
  orderTrackingId: z.string().min(1, "Order tracking ID is required"),
  merchantReference: z.string().optional(),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "CANCELLED"]).optional(),
});

// PesaPal IPN Validation
export const pesapalIPNSchema = z.object({
  OrderTrackingId: z.string().min(1, "Order tracking ID is required"),
  Status: z.enum(["COMPLETED", "PENDING", "FAILED", "CANCELLED"]),
  PaymentMethod: z.string().optional(),
});

// Webhook Validation (Clerk)
export const clerkWebhookSchema = z.object({
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(
      z.object({
        email_address: z.string().email(),
        verification: z.object({
          status: z.string(),
        }).optional(),
      })
    ).optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    image_url: z.string().url().optional(),
    public_metadata: z.record(z.any()).optional(),
  }),
});

// Profile Update Validation
export const profileUpdateSchema = z.object({
  display_name: z.string().min(2, "Display name must be at least 2 characters").max(100).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100).optional(),
  phone_number: z.string().regex(/^\+?[\d\s-]{10,20}$/, "Invalid phone number format").optional(),
  hourly_rate: z.number().min(0).optional(),
});

// Withdrawal Request Validation
export const withdrawalSchema = z.object({
  amount: z.number().min(500, "Minimum withdrawal is 500 KES"),
  payment_method: z.enum(["mpesa", "bank_transfer", "paypal"]),
  payment_details: z.string().min(5, "Payment details required"),
});

// Gift Validation
export const giftSchema = z.object({
  receiver_id: z.string().uuid(),
  amount: z.number().min(10, "Minimum gift is 10 KES"),
  message: z.string().max(200).optional(),
});

// Message Validation
export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

// Coin Purchase Validation
export const coinPurchaseSchema = z.object({
  package_id: z.enum(["starter", "popular", "premium", "elite"]),
  amount: z.number().positive(),
});
