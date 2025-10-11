/*
  # Create Initial Schema for CineAdmin

  1. New Tables
    - `dramas`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `thumbnail_url` (text)
      - `genre` (text)
      - `release_date` (date)
      - `status` (text) - ongoing, completed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `series`
      - `id` (uuid, primary key)
      - `drama_id` (uuid, foreign key to dramas)
      - `title` (text, not null)
      - `series_number` (integer, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `videos`
      - `id` (uuid, primary key)
      - `series_id` (uuid, foreign key to series)
      - `title` (text, not null)
      - `video_url` (text, not null)
      - `duration` (integer) - in seconds
      - `episode_number` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `movies`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `thumbnail_url` (text)
      - `video_url` (text, not null)
      - `genre` (text)
      - `release_date` (date)
      - `duration` (integer) - in seconds
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `subscription_packages`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `duration_days` (integer, not null)
      - `features` (jsonb)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `full_name` (text)
      - `subscription_id` (uuid, foreign key to subscription_packages)
      - `subscription_start` (timestamptz)
      - `subscription_end` (timestamptz)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users to manage all data
    - Note: This is an admin dashboard, so policies allow full access to authenticated users
*/

-- Create dramas table
CREATE TABLE IF NOT EXISTS dramas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  genre text,
  release_date date,
  status text DEFAULT 'ongoing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create series table
CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drama_id uuid REFERENCES dramas(id) ON DELETE CASCADE,
  title text NOT NULL,
  series_number integer NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES series(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NOT NULL,
  duration integer,
  episode_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  genre text,
  release_date date,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_packages table
CREATE TABLE IF NOT EXISTS subscription_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  subscription_id uuid REFERENCES subscription_packages(id) ON DELETE SET NULL,
  subscription_start timestamptz,
  subscription_end timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for dramas
CREATE POLICY "Allow all operations for authenticated users"
  ON dramas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for series
CREATE POLICY "Allow all operations for authenticated users"
  ON series FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for videos
CREATE POLICY "Allow all operations for authenticated users"
  ON videos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for movies
CREATE POLICY "Allow all operations for authenticated users"
  ON movies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for subscription_packages
CREATE POLICY "Allow all operations for authenticated users"
  ON subscription_packages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for users
CREATE POLICY "Allow all operations for authenticated users"
  ON users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_series_drama_id ON series(drama_id);
CREATE INDEX IF NOT EXISTS idx_videos_series_id ON videos(series_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_dramas_updated_at BEFORE UPDATE ON dramas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_packages_updated_at BEFORE UPDATE ON subscription_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();