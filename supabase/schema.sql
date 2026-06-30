-- ELITEHUB Supabase Schema
-- Run this in Supabase SQL Editor to create all tables, RLS policies, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────────────
-- 1. USERS TABLE (synced from Clerk)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'companion', 'admin')) DEFAULT 'client',
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  coins INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'pending', 'cancelled')),
  subscription_expires_at TIMESTAMPTZ,
  age_verified BOOLEAN DEFAULT FALSE,
  age_verified_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  hourly_rate DECIMAL(10,2),
  location TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (clerk_id = auth.uid()::text OR auth.uid()::text IS NOT NULL);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "Public can read companions" ON users
  FOR SELECT USING (role = 'companion' AND subscription_status = 'active');

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 2. PLATFORM SETTINGS (dynamic pricing)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings" ON platform_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage settings" ON platform_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
('client_subscription_price', '1000', 'Monthly client subscription in KES'),
('companion_subscription_price', '2000', 'Monthly companion subscription in KES'),
('coin_price_per_unit', '5', 'Price per coin in KES'),
('message_cost_coins', '10', 'Cost per message in coins'),
('platform_gift_commission', '20', 'Platform commission percentage on gifts'),
('withdrawal_fee', '50', 'Flat withdrawal fee in KES'),
('minimum_withdrawal', '500', 'Minimum withdrawal amount in KES'),
('featured_companion_price', '5000', 'Monthly featured placement in KES');

-- ───────────────────────────────────────────────────────────────────────────
-- 3. SUBSCRIPTIONS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('client', 'companion')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 4. COIN TRANSACTIONS (audit trail)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'gift_received', 'gift_sent', 'refund', 'withdrawal')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON coin_transactions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Admins can read all transactions" ON coin_transactions
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 5. CONVERSATIONS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companion_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, companion_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations" ON conversations
  FOR SELECT USING (
    client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (
    client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 6. MESSAGES
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
           OR c.companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text))
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
           OR c.companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text))
    )
  );

CREATE POLICY "Users can update message read status" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
           OR c.companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text))
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 7. BLOCKED USERS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own blocks" ON blocked_users
  FOR ALL USING (blocker_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ───────────────────────────────────────────────────────────────────────────
-- 8. WITHDRAWAL REQUESTS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_method TEXT NOT NULL,
  payment_details TEXT NOT NULL,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals" ON withdrawal_requests
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can create own withdrawals" ON withdrawal_requests
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 9. GIFTS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read gifts they sent or received" ON gifts
  FOR SELECT USING (
    sender_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR receiver_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Admins can manage all gifts" ON gifts
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 10. REFERRALS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
  bonus_amount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT USING (
    referrer_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR referred_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 11. PAYMENT TRANSACTIONS (PesaPal)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_tracking_id TEXT NOT NULL UNIQUE,
  merchant_reference TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  description TEXT NOT NULL,
  pesapal_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments" ON payment_transactions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Admins can manage all payments" ON payment_transactions
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 12. FAVORITES
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companion_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, companion_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Companions can read who favorited them" ON favorites
  FOR SELECT USING (companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ───────────────────────────────────────────────────────────────────────────
-- 13. BLOG POSTS
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all posts" ON blog_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 14. ALBUMS (Phase 2)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  companion_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  price DECIMAL(12,2) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published albums" ON albums
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Companions can manage own albums" ON albums
  FOR ALL USING (companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Admins can manage all albums" ON albums
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE clerk_id = auth.uid()::text AND role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- 15. ALBUM MEDIA (Phase 2)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE album_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media in published albums" ON album_media
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM albums a WHERE a.id = album_media.album_id AND a.is_published = TRUE)
  );

CREATE POLICY "Companions can manage own media" ON album_media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM albums a WHERE a.id = album_media.album_id AND a.companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text))
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 16. ALBUM UNLOCKS (Phase 2)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE album_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  price_paid DECIMAL(12,2) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, album_id)
);

ALTER TABLE album_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own unlocks" ON album_unlocks
  FOR SELECT USING (client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ───────────────────────────────────────────────────────────────────────────
-- 17. CUSTOM REQUESTS (Phase 2)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE custom_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companion_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  media_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own requests" ON custom_requests
  FOR SELECT USING (
    client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    OR companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can create requests" ON custom_requests
  FOR INSERT WITH CHECK (client_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Companions can update request status" ON custom_requests
  FOR UPDATE USING (companion_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- ───────────────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ───────────────────────────────────────────────────────────────────────────

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_requests_updated_at BEFORE UPDATE ON custom_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment user coins
CREATE OR REPLACE FUNCTION increment_coins(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET coins = coins + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last_message_id
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_id = NEW.id,
      last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_companion_id ON conversations(companion_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_gifts_sender_id ON gifts(sender_id);
CREATE INDEX idx_gifts_receiver_id ON gifts(receiver_id);
CREATE INDEX idx_favorites_client_id ON favorites(client_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_albums_companion_id ON albums(companion_id);
CREATE INDEX idx_custom_requests_client_id ON custom_requests(client_id);
CREATE INDEX idx_custom_requests_companion_id ON custom_requests(companion_id);
