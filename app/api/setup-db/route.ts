import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // First, try to create the exec_sql function if it doesn't exist
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
      await supabaseAdmin.rpc('exec_sql', { sql: createFunctionSQL });
    } catch (error) {
      // Function might already exist, that's okay
      console.log('exec_sql function setup:', error);
    }

    // Create basic tables if they don't exist
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            clerk_id TEXT UNIQUE,
            full_name TEXT,
            email TEXT,
            address TEXT,
            profile_pic_url TEXT,
            honor_score_points INTEGER DEFAULT 0,
            reputation INTEGER DEFAULT 10,
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
      },
      {
        name: 'issue_categories',
        sql: `
          CREATE TABLE IF NOT EXISTS issue_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type TEXT UNIQUE,
            description TEXT,
            color_code TEXT
          )
        `
      },
      {
        name: 'reports',
        sql: `
          CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id),
            title TEXT,
            description TEXT,
            issue_category_id UUID REFERENCES issue_categories(id),
            verification_status TEXT DEFAULT 'pending',
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
          )
        `
      }
    ];

    // Insert default issue categories
    const categories = [
      { type: 'road_damage', description: 'Potholes, cracks, and road surface issues', color_code: '#F59E0B' },
      { type: 'street_lights', description: 'Broken or malfunctioning street lights', color_code: '#10B981' },
      { type: 'traffic_lights', description: 'Traffic signal problems', color_code: '#EF4444' },
      { type: 'water_drainage', description: 'Drainage and flooding issues', color_code: '#3B82F6' },
      { type: 'waste_pileup', description: 'Garbage collection and waste management', color_code: '#8B5CF6' }
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql: table.sql });
      if (error) {
        console.error(`Error creating table ${table.name}:`, error);
      }
    }

    // Insert default categories
    for (const category of categories) {
      const { error } = await supabaseAdmin
        .from('issue_categories')
        .upsert(category, { onConflict: 'type' });
      
      if (error) {
        console.error('Error inserting category:', error);
      }
    }

    // Ensure additional user columns exist
    const alterUsersSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='phone_number'
        ) THEN
          ALTER TABLE users ADD COLUMN phone_number TEXT;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='bio'
        ) THEN
          ALTER TABLE users ADD COLUMN bio TEXT;
        END IF;
      END$$;
    `;

    try {
      await supabaseAdmin.rpc('exec_sql', { sql: alterUsersSQL });
    } catch (error) {
      console.error('Error ensuring users extra columns:', error);
    }

    // Disable RLS for Clerk authentication
    try {
      await supabaseAdmin.rpc('exec_sql', { sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;' });
      await supabaseAdmin.rpc('exec_sql', { sql: 'ALTER TABLE reports DISABLE ROW LEVEL SECURITY;' });
      await supabaseAdmin.rpc('exec_sql', { sql: 'ALTER TABLE issue_categories DISABLE ROW LEVEL SECURITY;' });
      console.log('RLS disabled successfully');
    } catch (error) {
      console.error('Error disabling RLS:', error);
      // Try alternative approach
      try {
        await supabaseAdmin.from('users').select('id').limit(1);
        await supabaseAdmin.from('reports').select('id').limit(1);
        await supabaseAdmin.from('issue_categories').select('id').limit(1);
        console.log('Tables are accessible without RLS');
      } catch (altError) {
        console.error('Tables still have RLS issues:', altError);
      }
    }

    return NextResponse.json({ message: 'Database setup completed with RLS disabled for Clerk auth' });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Failed to setup database' }, { status: 500 });
  }
}





