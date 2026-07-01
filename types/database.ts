export type UserRole = 'client' | 'companion' | 'admin'

export interface User {
  id: string
  clerk_id: string
  email: string
  role: UserRole
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  wallet_balance: number
  coins: number
  subscription_status: 'active' | 'inactive' | 'pending' | 'cancelled'
  subscription_expires_at: string | null
  age_verified: boolean
  age_verified_at: string | null
  is_featured: boolean
  hourly_rate: number | null
  location: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}

export interface PlatformSetting {
  id: string
  key: string
  value: string
  description: string | null
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  type: 'client' | 'companion'
  amount: number
  status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired'
  started_at: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface CoinTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'spend' | 'gift_received' | 'gift_sent' | 'refund' | 'withdrawal'
  amount: number
  description: string | null
  related_user_id: string | null
  created_at: string
}

export interface Conversation {
  id: string
  client_id: string
  companion_id: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  client?: User
  companion?: User
  last_message?: Message
  unread_count?: number
}

export interface GiftItem {
  id: string
  name: string
  icon: string
  coin_cost: number
  sort_order: number
  is_active: boolean
  category: 'standard' | 'premium' | 'luxury'
  created_at: string
  updated_at: string
}

export interface GiftTransaction {
  id: string
  sender_id: string
  receiver_id: string
  conversation_id: string | null
  gift_item_id: string | null
  coin_cost: number
  companion_share: number
  platform_share: number
  split_percent: number
  message_id: string | null
  personal_message: string | null
  created_at: string
  sender?: User
  receiver?: User
  gift_item?: GiftItem
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  gift_transaction_id?: string | null
  message_type?: 'text' | 'gift' | 'image' | 'system'
  sender?: User
  gift_transaction?: GiftTransaction
}

export interface BlockedUser {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
  blocked?: User
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  payment_method: string
  payment_details: string
  processed_at: string | null
  processed_by: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface Gift {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  platform_fee: number
  net_amount: number
  message: string | null
  created_at: string
  sender?: User
  receiver?: User
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  status: 'pending' | 'completed' | 'paid'
  bonus_amount: number
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  user_id: string
  order_tracking_id: string
  merchant_reference: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_method: string | null
  description: string
  pesapal_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  client_id: string
  companion_id: string
  created_at: string
  companion?: User
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author_id: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  author?: User
}

export interface Album {
  id: string
  companion_id: string
  title: string
  description: string | null
  cover_image: string | null
  price: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AlbumMedia {
  id: string
  album_id: string
  media_url: string
  media_type: 'image' | 'video'
  sort_order: number
  created_at: string
}

export interface AlbumUnlock {
  id: string
  client_id: string
  album_id: string
  price_paid: number
  unlocked_at: string
}

export interface CustomRequest {
  id: string
  client_id: string
  companion_id: string
  description: string
  price: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  media_url: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}
