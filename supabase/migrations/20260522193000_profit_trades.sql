CREATE TABLE IF NOT EXISTS public.profit_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name text NOT NULL CHECK (char_length(account_name) BETWEEN 1 AND 100),
  game text NOT NULL DEFAULT 'Raid Shadow Legends',
  buy_date date NOT NULL,
  buy_price numeric NOT NULL DEFAULT 0 CHECK (buy_price >= 0),
  sell_date date,
  sell_price numeric CHECK (sell_price IS NULL OR sell_price >= 0),
  payment_method text,
  customer_name text,
  status text NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'reserved', 'sold')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profit_trades_status_updated_at
  ON public.profit_trades (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_profit_trades_sell_date
  ON public.profit_trades (sell_date DESC);

ALTER TABLE public.profit_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profit_trades_admin_select" ON public.profit_trades;
CREATE POLICY "profit_trades_admin_select"
  ON public.profit_trades
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "profit_trades_admin_insert" ON public.profit_trades;
CREATE POLICY "profit_trades_admin_insert"
  ON public.profit_trades
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "profit_trades_admin_update" ON public.profit_trades;
CREATE POLICY "profit_trades_admin_update"
  ON public.profit_trades
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "profit_trades_admin_delete" ON public.profit_trades;
CREATE POLICY "profit_trades_admin_delete"
  ON public.profit_trades
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
