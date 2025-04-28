/*
  # Initial schema setup for budget tracker

  1. Tables
    - users (handled by Supabase Auth)
    - expenses
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - amount (numeric)
      - description (text)
      - category (text)
      - date (date)
      - created_at (timestamp)
    - budgets
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - month (text)
      - categories (jsonb)
      - total_budget (numeric)
    - savings_goals
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - target_amount (numeric)
      - current_amount (numeric)
      - start_date (date)
      - target_date (date)
      - category (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  categories jsonb NOT NULL DEFAULT '{}',
  total_budget numeric NOT NULL CHECK (total_budget >= 0),
  UNIQUE (user_id, month)
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  start_date date NOT NULL,
  target_date date NOT NULL,
  category text,
  CHECK (target_date >= start_date),
  CHECK (current_amount <= target_amount)
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Policies for expenses
CREATE POLICY "Users can manage their own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for budgets
CREATE POLICY "Users can manage their own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for savings goals
CREATE POLICY "Users can manage their own savings goals"
  ON savings_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS budgets_user_id_month_idx ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS savings_goals_user_id_idx ON savings_goals(user_id);