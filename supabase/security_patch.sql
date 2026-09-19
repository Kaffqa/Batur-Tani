-- ============================================================
-- BATUR TANI - SECURITY PATCH (Database Vulnerability Fixes)
-- ============================================================
-- Jalankan kode SQL ini di SQL Editor Supabase Anda
-- (Dashboard -> SQL Editor -> New Query -> Paste -> Run)
-- ============================================================

-- ============================================================
-- 1. MENCEGAH MANIPULASI HARGA & PEMBELIAN MELEBIHI STOK
-- ============================================================
CREATE OR REPLACE FUNCTION process_new_order()
RETURNS TRIGGER AS $$
DECLARE
  v_price INTEGER;
  v_stock INTEGER;
BEGIN
  -- Ambil harga asli dan sisa stok dari tabel komoditas
  SELECT price_per_unit, stock_projection INTO v_price, v_stock
  FROM commodities
  WHERE id = NEW.commodity_id;

  -- A. Validasi Stok (Mencegah Overstock)
  IF NEW.quantity > v_stock THEN
    RAISE EXCEPTION 'Stok tidak mencukupi. Sisa stok: %', v_stock;
  END IF;

  -- B. Paksa perhitungan harga di sisi server (Mencegah Hacker ubah harga jadi Rp 1)
  NEW.locked_price := v_price;
  NEW.total_amount := NEW.quantity * v_price;

  -- C. Potong stok petani secara otomatis
  UPDATE commodities
  SET stock_projection = stock_projection - NEW.quantity
  WHERE id = NEW.commodity_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang Trigger pada tabel orders
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION process_new_order();


-- ============================================================
-- 2. MENCEGAH PENCURIAN PERAN (ROLE ESCALATION)
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Paksa kolom 'role' agar tidak bisa diubah oleh user itu sendiri
  -- (Jika tadinya buyer, akan dipaksa tetap buyer meskipun dia mencoba mengirim data 'farmer')
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang Trigger pada tabel profiles
DROP TRIGGER IF EXISTS on_profile_update ON profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();


-- ============================================================
-- 3. MENGUNCI TRANSAKSI KEUANGAN (ESCROW) DENGAN RPC
-- ============================================================
-- Hapus kebijakan (RLS) lama yang berisiko karena mengizinkan frontend menulis data
DROP POLICY IF EXISTS "System can manage escrow" ON escrow_transactions;
DROP POLICY IF EXISTS "System can update escrow" ON escrow_transactions;

-- Buat Jalur Khusus (RPC) untuk membuat transaksi awal
CREATE OR REPLACE FUNCTION create_escrow_sandbox(
  p_order_id UUID,
  p_midtrans_order_id TEXT,
  p_snap_token TEXT,
  p_amount INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO escrow_transactions (order_id, midtrans_order_id, snap_token, amount, status)
  VALUES (p_order_id, p_midtrans_order_id, p_snap_token, p_amount, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buat Jalur Khusus (RPC) untuk mensimulasikan pembayaran selesai
CREATE OR REPLACE FUNCTION complete_escrow_sandbox(
  p_order_id UUID,
  p_payment_type TEXT
)
RETURNS void AS $$
BEGIN
  -- Update status transaksi escrow menjadi on_hold (dana ditahan sistem)
  UPDATE escrow_transactions
  SET status = 'on_hold',
      payment_type = p_payment_type,
      paid_at = NOW()
  WHERE order_id = p_order_id;

  -- Update status pesanan (order)
  UPDATE orders
  SET status = 'on_hold'
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
