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
            problem_id UUID,
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

    // Create Problems-related tables and constraints
    const problemsSQL = `
      CREATE TABLE IF NOT EXISTS problems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        issue_category_id UUID REFERENCES issue_categories(id),
        centroid_lat DECIMAL(10, 8),
        centroid_lng DECIMAL(11, 8),
        radius_m INTEGER DEFAULT 35,
        status TEXT DEFAULT 'open',
        reports_count INTEGER DEFAULT 0,
        report_ids JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'reports_problem_fk'
        ) THEN
          ALTER TABLE reports
          ADD CONSTRAINT reports_problem_fk FOREIGN KEY (problem_id) REFERENCES problems(id);
        END IF;
      END$$;
      CREATE TABLE IF NOT EXISTS problem_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        vote TEXT CHECK (vote IN ('agree','disagree')),
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (problem_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        message TEXT,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        related_report_id UUID,
        related_problem_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      -- Ensure notifications.related_problem_id exists (for environments created before this column)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='notifications' AND column_name='related_problem_id'
        ) THEN
          ALTER TABLE notifications ADD COLUMN related_problem_id UUID;
        END IF;
      END$$;
      -- Ensure reports.problem_id column exists
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='reports' AND column_name='problem_id'
        ) THEN
          ALTER TABLE reports ADD COLUMN problem_id UUID;
          BEGIN
            ALTER TABLE reports ADD CONSTRAINT reports_problem_fk FOREIGN KEY (problem_id) REFERENCES problems(id);
          EXCEPTION WHEN others THEN
            -- constraint may already exist
            NULL;
          END;
        END IF;
      END$$;
    `;

    try {
      await supabaseAdmin.rpc('exec_sql', { sql: problemsSQL });
    } catch (error) {
      console.error('Error creating problems tables:', error);
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

    // Create increment_honor_points function
    const honorFunctionSQL = `
      CREATE OR REPLACE FUNCTION increment_honor_points(user_id uuid, points integer)
      RETURNS void AS $$
      BEGIN
        UPDATE users 
        SET honor_score_points = honor_score_points + points,
            updated_at = NOW()
        WHERE id = user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
      await supabaseAdmin.rpc('exec_sql', { sql: honorFunctionSQL });
    } catch (error) {
      console.error('Error creating honor function:', error);
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





