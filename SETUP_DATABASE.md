# CivicEye Database Integration Setup

This document provides step-by-step instructions to set up the Supabase database integration for CivicEye.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Clerk Account**: Set up authentication at [clerk.com](https://clerk.com)
3. **Node.js**: Version 18 or higher

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Run Database Schema

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  address TEXT,
  profile_pic_url TEXT,
  honor_score_points INTEGER DEFAULT 10,
  reputation INTEGER DEFAULT 10,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue categories
CREATE TABLE issue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT UNIQUE NOT NULL,
  description TEXT,
  color_code TEXT
);

-- Insert default categories
INSERT INTO issue_categories (type, description, color_code) VALUES
('road_damage', 'Potholes, cracks, road damage', '#FF6B6B'),
('street_lights', 'Broken or malfunctioning street lights', '#4ECDC4'),
('traffic_lights', 'Traffic signal issues', '#45B7D1'),
('water_drainage', 'Water logging, drainage problems', '#96CEB4'),
('waste_pileup', 'Garbage collection issues', '#FFEAA7');

-- Reports table  
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  issue_category_id UUID REFERENCES issue_categories(id),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
  verification_color TEXT DEFAULT 'yellow',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  images JSONB DEFAULT '[]',
  ai_confidence_score DECIMAL(3, 2),
  multiple_report_confidence_score DECIMAL(3, 2),
  harmful_content BOOLEAN DEFAULT false,
  final_confidence_score DECIMAL(3, 2),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipality actions
CREATE TABLE municipality_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('planning', 'in_progress', 'completed', 'rejected', 'on_hold')),
  action_color TEXT,
  action_description TEXT,
  assigned_department TEXT,
  estimated_completion DATE,
  start_date DATE,
  end_date DATE,
  cost_estimate DECIMAL(12, 2),
  priority_level INTEGER DEFAULT 3,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  reports_submitted INTEGER DEFAULT 0,
  verified_reports INTEGER DEFAULT 0,
  rank_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heatmap data
CREATE TABLE heatmap_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_reports INTEGER DEFAULT 0,
  pending_reports INTEGER DEFAULT 0,
  resolved_reports INTEGER DEFAULT 0,
  intensity_score DECIMAL(3, 2),
  last_report_date TIMESTAMPTZ
);

-- Report validations
CREATE TABLE report_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  validator_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_valid BOOLEAN,
  validation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, validator_user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_report_id UUID REFERENCES reports(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(verification_status);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_municipality_actions_report_id ON municipality_actions(report_id);
CREATE INDEX idx_leaderboard_points ON leaderboard(total_points DESC);
CREATE INDEX idx_heatmap_location ON heatmap_data(latitude, longitude);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);

-- Create functions
CREATE OR REPLACE FUNCTION get_verification_color(status TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE status
    WHEN 'pending' THEN RETURN 'yellow';
    WHEN 'verified' THEN RETURN 'green';
    WHEN 'rejected' THEN RETURN 'red';
    WHEN 'under_review' THEN RETURN 'blue';
    ELSE RETURN 'yellow';
  END CASE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_action_color(action_type TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE action_type
    WHEN 'planning' THEN RETURN 'orange';
    WHEN 'in_progress' THEN RETURN 'blue';
    WHEN 'completed' THEN RETURN 'green';
    WHEN 'rejected' THEN RETURN 'red';
    WHEN 'on_hold' THEN RETURN 'yellow';
    ELSE RETURN 'orange';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE OR REPLACE FUNCTION update_verification_color()
RETURNS TRIGGER AS $$
BEGIN
  NEW.verification_color = get_verification_color(NEW.verification_status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verification_color
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_color();

CREATE OR REPLACE FUNCTION update_action_color()
RETURNS TRIGGER AS $$
BEGIN
  NEW.action_color = get_action_color(NEW.action_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_action_color
  BEFORE UPDATE ON municipality_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_action_color();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipality_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Allow authenticated users to view users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Reports policies
CREATE POLICY "Allow users to view verified reports and their own reports" ON reports
  FOR SELECT USING (
    verification_status = 'verified' OR 
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Allow authenticated users to create reports" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own reports" ON reports
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

-- Municipality actions policies
CREATE POLICY "Allow authenticated users to view municipality actions" ON municipality_actions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Leaderboard policies
CREATE POLICY "Allow authenticated users to view leaderboard" ON leaderboard
  FOR SELECT USING (auth.role() = 'authenticated');

-- Heatmap data policies
CREATE POLICY "Allow authenticated users to view heatmap data" ON heatmap_data
  FOR SELECT USING (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "Allow users to view their own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Allow users to update their own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );
```

### 3. Set up Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Create two buckets:
   - `report-images` (public: true)
   - `profile-pics` (public: true)

### 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Clerk Setup

### 1. Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Copy your publishable key and secret key
3. Set up the webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
4. Copy the webhook secret

### 2. Configure Redirect URLs

In your Clerk dashboard, set:
- **Sign-in redirect URL**: `http://localhost:3000/dashboard`
- **Sign-up redirect URL**: `http://localhost:3000/dashboard`

## Testing the Integration

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Test the flow**:
   - Sign up with a new account
   - Check if user is created in Supabase
   - Submit a report
   - Verify it appears in the admin dashboard
   - Test admin verification workflow

## Features Implemented

✅ **User Authentication & Role Management**
- Clerk integration with automatic user sync
- Admin role assignment for your email
- Role-based dashboard routing

✅ **Report Management**
- Create, view, and manage reports
- Image upload support (UI ready)
- Location-based reporting
- Issue categorization

✅ **Admin Dashboard**
- Real-time statistics
- Report verification workflow
- Municipality actions management
- Auto-verification for confidence >=80%

✅ **User Dashboard**
- Personal statistics
- Recent reports view
- Quick actions

✅ **Leaderboard System**
- Real-time rankings
- Points and reputation tracking
- Community engagement metrics

✅ **Heatmap Visualization**
- Geographic issue distribution
- Intensity scoring
- Area-based analytics

✅ **Status Management**
- Color-coded status badges
- Verification workflow
- Action tracking

## Next Steps

1. **Add AI Integration**: Implement confidence scoring and auto-verification
2. **Image Upload**: Complete the image upload functionality
3. **Real-time Updates**: Add WebSocket support for live updates
4. **Mobile App**: Create React Native version
5. **Advanced Analytics**: Add more detailed reporting and charts

## Troubleshooting

### Common Issues

1. **User not syncing**: Check Clerk webhook configuration
2. **Database errors**: Verify RLS policies and user permissions
3. **Build errors**: Ensure all environment variables are set
4. **Authentication issues**: Check Clerk configuration and redirect URLs

### Support

For issues or questions, check:
- Supabase documentation
- Clerk documentation
- Next.js documentation



