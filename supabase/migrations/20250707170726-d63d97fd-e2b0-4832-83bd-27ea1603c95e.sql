-- Add transaction_id columns to purchases and borrows tables
ALTER TABLE public.purchases ADD COLUMN transaction_id TEXT;
ALTER TABLE public.borrows ADD COLUMN transaction_id TEXT;

-- Create sequences for auto-incrementing transaction IDs
CREATE SEQUENCE purchase_transaction_seq START 1;
CREATE SEQUENCE borrow_transaction_seq START 1;

-- Create functions to generate transaction IDs
CREATE OR REPLACE FUNCTION generate_purchase_transaction_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 's' || nextval('purchase_transaction_seq');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_borrow_transaction_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'b' || nextval('borrow_transaction_seq');
END;
$$ LANGUAGE plpgsql;

-- Set default values for new columns
ALTER TABLE public.purchases ALTER COLUMN transaction_id SET DEFAULT generate_purchase_transaction_id();
ALTER TABLE public.borrows ALTER COLUMN transaction_id SET DEFAULT generate_borrow_transaction_id();

-- Update existing records to have transaction IDs
UPDATE public.purchases SET transaction_id = generate_purchase_transaction_id() WHERE transaction_id IS NULL;
UPDATE public.borrows SET transaction_id = generate_borrow_transaction_id() WHERE transaction_id IS NULL;