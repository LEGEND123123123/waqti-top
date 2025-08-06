/*
  # Complete Waqti Platform Database Schema

  1. New Tables
    - `users` - Extended user profiles with time credits
    - `services` - Service listings and offerings  
    - `bookings` - Service reservations and scheduling
    - `transactions` - Escrow and time credit transfers
    - `messages` - Real-time messaging system
    - `reviews` - Service ratings and feedback
    - `freelancer_verifications` - Multi-step verification process
    - `notifications` - User notification system
    - `disputes` - Escrow dispute resolution
    - `portfolio_items` - Freelancer portfolio management

  2. Security
    - Enable RLS on all tables
    - User-specific access policies
    - Admin-only management policies
    - Secure transaction functions

  3. Functions
    - Atomic time credit transfers
    - Escrow creation and release
    - Auto-release mechanism
    - Balance validation
*/

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  balance INTEGER DEFAULT 2 CHECK (balance >= 0),
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'freelancer', 'admin')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'completed', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  bio TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate > 0),
  location TEXT NOT NULL,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  requirements TEXT,
  delivery_time INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  total_hours INTEGER NOT NULL CHECK (total_hours > 0),
  notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (for escrow and time credits)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed', 'refunded')),
  transaction_type TEXT NOT NULL DEFAULT 'escrow' CHECK (transaction_type IN ('escrow', 'transfer', 'purchase', 'refund')),
  terms TEXT,
  auto_release_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '72 hours'),
  released_at TIMESTAMPTZ,
  dispute_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'audio', 'video')),
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  would_recommend BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  provider_response TEXT,
  provider_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freelancer verification table
CREATE TABLE IF NOT EXISTS public.freelancer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('independent', 'entrepreneur')),
  job_title TEXT NOT NULL,
  specialization TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  introduction TEXT NOT NULL,
  portfolio_items JSONB DEFAULT '[]',
  certificates JSONB DEFAULT '[]',
  test_answers JSONB DEFAULT '{}',
  test_score INTEGER DEFAULT 0,
  test_passed BOOLEAN DEFAULT false,
  admin_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'message', 'payment', 'review', 'system', 'verification')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quality', 'delivery', 'communication', 'payment', 'other')),
  reason TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  project_url TEXT,
  skills TEXT[] DEFAULT '{}',
  category TEXT,
  completion_date DATE,
  client_name TEXT,
  client_testimonial TEXT,
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
  title TEXT,
  participants UUID[] NOT NULL,
  last_message_id UUID,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for services table
CREATE POLICY "Anyone can read active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create own services" ON public.services
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Users can update own services" ON public.services
  FOR UPDATE USING (auth.uid() = provider_id);

-- RLS Policies for bookings table
CREATE POLICY "Users can read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS Policies for messages table
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for reviews table
CREATE POLICY "Anyone can read public reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Providers can respond to reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = provider_id);

-- RLS Policies for freelancer_verifications table
CREATE POLICY "Users can read own verification" ON public.freelancer_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification" ON public.freelancer_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification" ON public.freelancer_verifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications" ON public.freelancer_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for disputes table
CREATE POLICY "Users can read own disputes" ON public.disputes
  FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = respondent_id);

CREATE POLICY "Users can create disputes" ON public.disputes
  FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Admins can manage all disputes" ON public.disputes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for portfolio_items table
CREATE POLICY "Anyone can read public portfolio" ON public.portfolio_items
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for conversations table
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Database functions for atomic operations
CREATE OR REPLACE FUNCTION public.transfer_time_credits(
  from_user_id UUID,
  to_user_id UUID,
  amount INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check sufficient balance
  IF (SELECT balance FROM public.users WHERE id = from_user_id) < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Perform atomic transfer
  UPDATE public.users SET balance = balance - amount, updated_at = NOW() WHERE id = from_user_id;
  UPDATE public.users SET balance = balance + amount, updated_at = NOW() WHERE id = to_user_id;
  
  -- Log transaction
  INSERT INTO public.transactions (client_id, freelancer_id, amount, status, transaction_type)
  VALUES (from_user_id, to_user_id, amount, 'completed', 'transfer');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_escrow_transaction(
  client_id UUID,
  freelancer_id UUID,
  service_id UUID,
  amount INTEGER,
  terms TEXT
) RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  client_balance INTEGER;
BEGIN
  -- Check client balance
  SELECT balance INTO client_balance FROM public.users WHERE id = client_id;
  
  IF client_balance < amount THEN
    RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', amount, client_balance;
  END IF;
  
  -- Deduct from client
  UPDATE public.users 
  SET balance = balance - amount, updated_at = NOW() 
  WHERE id = client_id;
  
  -- Create escrow transaction
  INSERT INTO public.transactions (client_id, freelancer_id, service_id, amount, terms, transaction_type)
  VALUES (client_id, freelancer_id, service_id, amount, terms, 'escrow')
  RETURNING id INTO transaction_id;
  
  -- Create notification for freelancer
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    freelancer_id, 
    'payment', 
    'Escrow Created', 
    'A client has created an escrow for ' || amount || ' time credits'
  );
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.release_escrow(
  transaction_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record FROM public.transactions WHERE id = transaction_id;
  
  IF NOT FOUND OR transaction_record.status != 'held' THEN
    RETURN FALSE;
  END IF;
  
  -- Credit freelancer
  UPDATE public.users 
  SET balance = balance + transaction_record.amount, updated_at = NOW()
  WHERE id = transaction_record.freelancer_id;
  
  -- Update transaction status
  UPDATE public.transactions 
  SET status = 'released', released_at = NOW(), updated_at = NOW()
  WHERE id = transaction_id;
  
  -- Create notification for freelancer
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    transaction_record.freelancer_id,
    'payment',
    'Payment Released',
    'You have received ' || transaction_record.amount || ' time credits'
  );
  
  -- Create notification for client
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    transaction_record.client_id,
    'payment',
    'Payment Completed',
    'Escrow payment of ' || transaction_record.amount || ' time credits has been released'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refund_escrow(
  transaction_id UUID,
  reason TEXT DEFAULT 'Service cancelled'
) RETURNS BOOLEAN AS $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record FROM public.transactions WHERE id = transaction_id;
  
  IF NOT FOUND OR transaction_record.status != 'held' THEN
    RETURN FALSE;
  END IF;
  
  -- Refund client
  UPDATE public.users 
  SET balance = balance + transaction_record.amount, updated_at = NOW()
  WHERE id = transaction_record.client_id;
  
  -- Update transaction status
  UPDATE public.transactions 
  SET status = 'refunded', updated_at = NOW()
  WHERE id = transaction_id;
  
  -- Create notifications
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES 
    (transaction_record.client_id, 'payment', 'Escrow Refunded', 'Your ' || transaction_record.amount || ' time credits have been refunded'),
    (transaction_record.freelancer_id, 'system', 'Service Cancelled', 'The escrow for this service has been refunded to the client');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-release expired escrows
CREATE OR REPLACE FUNCTION public.auto_release_expired_escrows()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER := 0;
  expired_transaction RECORD;
BEGIN
  -- Find expired escrows
  FOR expired_transaction IN 
    SELECT id FROM public.transactions 
    WHERE status = 'held' 
    AND auto_release_at <= NOW()
  LOOP
    -- Release each expired escrow
    IF public.release_escrow(expired_transaction.id) THEN
      released_count := released_count + 1;
    END IF;
  END LOOP;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_services', COALESCE((SELECT COUNT(*) FROM public.services WHERE provider_id = user_id), 0),
    'completed_bookings', COALESCE((SELECT COUNT(*) FROM public.bookings WHERE provider_id = user_id AND status = 'completed'), 0),
    'average_rating', COALESCE((SELECT AVG(rating) FROM public.reviews WHERE provider_id = user_id), 0),
    'total_reviews', COALESCE((SELECT COUNT(*) FROM public.reviews WHERE provider_id = user_id), 0),
    'total_earnings', COALESCE((SELECT SUM(amount) FROM public.transactions WHERE freelancer_id = user_id AND status = 'released'), 0),
    'response_time', 2, -- Default response time in hours
    'completion_rate', 98 -- Default completion rate percentage
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_rating ON public.services(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_freelancer_id ON public.transactions(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_services_search ON public.services USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING gin(to_tsvector('english', name || ' ' || COALESCE(bio, '')));