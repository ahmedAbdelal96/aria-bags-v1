-- ARIA order operations workflow
-- Forward-only migration for the final order lifecycle and admin workflow.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_attempts INTEGER,
  ADD COLUMN IF NOT EXISTS last_contact_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipping_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS return_reason TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

UPDATE public.orders
SET confirmation_attempts = COALESCE(confirmation_attempts, 0);

ALTER TABLE public.orders
  ALTER COLUMN confirmation_attempts SET DEFAULT 0,
  ALTER COLUMN confirmation_attempts SET NOT NULL,
  ALTER COLUMN status_updated_at SET DEFAULT now(),
  ALTER COLUMN status SET DEFAULT 'pending_confirmation',
  ALTER COLUMN total_amount SET DEFAULT 0,
  ALTER COLUMN payment_method SET DEFAULT 'cod',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.orders
SET
  status = CASE LOWER(COALESCE(status, ''))
    WHEN 'pending' THEN 'pending_confirmation'
    WHEN 'processing' THEN 'confirmed'
    WHEN 'preparing' THEN 'confirmed'
    WHEN 'shipped' THEN 'shipping'
    WHEN 'completed' THEN 'delivered'
    WHEN 'pending_confirmation' THEN 'pending_confirmation'
    WHEN 'confirmed' THEN 'confirmed'
    WHEN 'shipping' THEN 'shipping'
    WHEN 'delivered' THEN 'delivered'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'returned' THEN 'returned'
    ELSE 'pending_confirmation'
  END,
  status_updated_at = now()
WHERE TRUE;

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'orders'
      AND c.contype = 'c'
      AND c.conname LIKE 'orders_status%'
      AND c.conname <> 'orders_status_check_final'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'orders'
      AND c.conname = 'orders_status_check_final'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check_final
      CHECK (status IN ('pending_confirmation', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returned'));
  END IF;
END $$;

UPDATE public.orders
SET confirmation_token = gen_random_uuid()::text
WHERE confirmation_token IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN confirmation_token SET DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_confirmation_token_unique_idx
ON public.orders (confirmation_token)
WHERE confirmation_token IS NOT NULL;

DROP FUNCTION IF EXISTS public.create_guest_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
);

DROP FUNCTION IF EXISTS public.create_guest_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
);

DROP FUNCTION IF EXISTS public.create_guest_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
);

DROP FUNCTION IF EXISTS public.get_guest_order_confirmation(
  UUID,
  UUID
);

DROP FUNCTION IF EXISTS public.update_order_status(
  UUID,
  TEXT,
  TEXT,
  TEXT
);

DROP FUNCTION IF EXISTS public.record_order_contact_attempt(
  UUID,
  TEXT
);

CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_phone_2 TEXT,
  p_shipping_address TEXT,
  p_notes TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_confirmation_token TEXT := gen_random_uuid()::text;
  v_total NUMERIC(10, 2) := 0;
  v_product RECORD;
  v_requested RECORD;
  v_requested_product_id UUID;
  v_quantity INTEGER;
  v_unit_price NUMERIC(10, 2);
  v_color_name TEXT;
  v_color_hex TEXT;
  v_color_stock INTEGER;
  v_updated_colors JSONB;
  v_color JSONB;
  v_colors JSONB;
  v_color_name_lower TEXT;
BEGIN
  IF COALESCE(btrim(p_customer_name), '') = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF COALESCE(btrim(p_customer_phone), '') = '' THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;

  IF COALESCE(btrim(p_shipping_address), '') = '' THEN
    RAISE EXCEPTION 'Shipping address is required';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one item is required';
  END IF;

  CREATE TEMP TABLE tmp_guest_checkout_items (
    product_id TEXT,
    color_name_key TEXT,
    color_name TEXT,
    quantity INTEGER
  ) ON COMMIT DROP;

  INSERT INTO tmp_guest_checkout_items (product_id, color_name_key, color_name, quantity)
  SELECT
    item.product_id,
    LOWER(NULLIF(BTRIM(item.color_name), '')) AS color_name_key,
    MIN(NULLIF(BTRIM(item.color_name), '')) AS color_name,
    SUM(item.quantity)::INTEGER AS quantity
  FROM jsonb_to_recordset(p_items) AS item(
    product_id TEXT,
    quantity INTEGER,
    color_name TEXT
  )
  GROUP BY 1, 2;

  INSERT INTO public.orders (
    id,
    user_id,
    confirmation_token,
    customer_name,
    customer_phone,
    customer_phone_2,
    shipping_address,
    notes,
    status,
    status_updated_at,
    total_amount,
    payment_method
  )
  VALUES (
    v_order_id,
    NULL,
    v_confirmation_token,
    p_customer_name,
    p_customer_phone,
    NULLIF(p_customer_phone_2, ''),
    jsonb_build_object(
      'full_name', p_customer_name,
      'phone', p_customer_phone,
      'phone_2', NULLIF(p_customer_phone_2, ''),
      'address', p_shipping_address,
      'notes', NULLIF(p_notes, '')
    ),
    NULLIF(p_notes, ''),
    'pending_confirmation',
    now(),
    0,
    'cod'
  );

  FOR v_requested IN
    SELECT *
    FROM tmp_guest_checkout_items
  LOOP
    BEGIN
      v_requested_product_id := v_requested.product_id::UUID;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Product not found';
    END;

    v_quantity := COALESCE(v_requested.quantity, 0);

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT *
    INTO v_product
    FROM public.products
    WHERE id = v_requested_product_id
      AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product is unavailable';
    END IF;

    v_unit_price := COALESCE(v_product.sale_price, v_product.price)::NUMERIC(10, 2);
    v_color_name := NULLIF(BTRIM(v_requested.color_name), '');
    v_color_name_lower := COALESCE(v_requested.color_name_key, '');
    v_colors := COALESCE(v_product.colors, '[]'::jsonb);
    v_color := NULL;
    v_updated_colors := v_colors;

    IF jsonb_typeof(v_colors) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Selected color is unavailable';
    END IF;

    IF jsonb_array_length(v_colors) > 0 THEN
      IF v_color_name IS NULL THEN
        RAISE EXCEPTION 'Selected color is unavailable';
      END IF;

      SELECT elem
      INTO v_color
      FROM jsonb_array_elements(v_colors) AS elem
      WHERE LOWER(elem->>'name') = v_color_name_lower
      LIMIT 1;

      IF v_color IS NULL THEN
        RAISE EXCEPTION 'Selected color is unavailable';
      END IF;

      v_color_stock := COALESCE(
        NULLIF(v_color->>'stock', '')::INTEGER,
        NULLIF(v_color->>'stock_quantity', '')::INTEGER,
        0
      );

      IF v_color_stock < v_quantity THEN
        RAISE EXCEPTION 'Not enough stock';
      END IF;

      v_color_stock := v_color_stock - v_quantity;

      SELECT COALESCE(
        jsonb_agg(
          CASE
            WHEN LOWER(elem->>'name') = v_color_name_lower THEN
              CASE
                WHEN (elem ? 'stock') AND (elem ? 'stock_quantity') THEN
                  jsonb_set(
                    jsonb_set(elem, '{stock}', to_jsonb(v_color_stock), true),
                    '{stock_quantity}', to_jsonb(v_color_stock), true
                  )
                WHEN elem ? 'stock_quantity' THEN
                  jsonb_set(elem, '{stock_quantity}', to_jsonb(v_color_stock), true)
                ELSE
                  jsonb_set(elem, '{stock}', to_jsonb(v_color_stock), true)
              END
            ELSE elem
          END
          ORDER BY ord
        ),
        '[]'::jsonb
      )
      INTO v_updated_colors
      FROM jsonb_array_elements(v_colors) WITH ORDINALITY AS color(elem, ord);

      UPDATE public.products
      SET colors = v_updated_colors
      WHERE id = v_product.id;

      v_color_hex := NULLIF(v_color->>'hex', '');
    ELSE
      IF v_color_name IS NOT NULL THEN
        RAISE EXCEPTION 'Selected color is unavailable';
      END IF;

      v_color_hex := NULL;
    END IF;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      color_name,
      color_hex,
      quantity,
      price,
      unit_price,
      total_price
    )
    VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_color_name,
      v_color_hex,
      v_quantity,
      v_unit_price,
      v_unit_price,
      v_unit_price * v_quantity
    );

    v_total := v_total + (v_unit_price * v_quantity);
  END LOOP;

  UPDATE public.orders
  SET total_amount = v_total
  WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'confirmation_token', v_confirmation_token,
    'total_amount', v_total
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_guest_order_confirmation(
  p_order_id UUID,
  p_confirmation_token UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
    AND confirmation_token = p_confirmation_token::text
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', COALESCE(oi.product_name, p.name),
        'product_image', p.image_url,
        'color_name', oi.color_name,
        'color_hex', oi.color_hex,
        'quantity', oi.quantity,
        'unit_price', COALESCE(oi.unit_price, oi.price),
        'total_price', COALESCE(oi.total_price, oi.price * oi.quantity),
        'price', oi.price
      )
      ORDER BY oi.created_at
    ),
    '[]'::jsonb
  )
  INTO v_items
  FROM public.order_items oi
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'confirmation_token', v_order.confirmation_token,
    'user_id', v_order.user_id,
    'customer_name', v_order.customer_name,
    'customer_phone', v_order.customer_phone,
    'customer_phone_2', v_order.customer_phone_2,
    'notes', v_order.notes,
    'shipping_address', v_order.shipping_address,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'total_amount', v_order.total_amount,
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at,
    'items', v_items
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_reason TEXT DEFAULT NULL,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_current_status TEXT;
  v_next_status TEXT;
  v_internal_notes TEXT;
  v_reason TEXT;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  v_current_status := LOWER(COALESCE(v_order.status, 'pending_confirmation'));
  v_next_status := CASE LOWER(BTRIM(COALESCE(p_status, '')))
    WHEN 'pending' THEN 'pending_confirmation'
    WHEN 'pending_confirmation' THEN 'pending_confirmation'
    WHEN 'processing' THEN 'confirmed'
    WHEN 'preparing' THEN 'confirmed'
    WHEN 'confirmed' THEN 'confirmed'
    WHEN 'shipped' THEN 'shipping'
    WHEN 'shipping' THEN 'shipping'
    WHEN 'completed' THEN 'delivered'
    WHEN 'delivered' THEN 'delivered'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'returned' THEN 'returned'
    ELSE NULL
  END;

  IF v_next_status IS NULL THEN
    RAISE EXCEPTION 'Invalid order status';
  END IF;

  IF NOT (
    (v_current_status = 'pending_confirmation' AND v_next_status IN ('confirmed', 'cancelled')) OR
    (v_current_status = 'confirmed' AND v_next_status IN ('shipping', 'cancelled')) OR
    (v_current_status = 'shipping' AND v_next_status IN ('delivered', 'returned', 'cancelled')) OR
    (v_current_status = 'returned' AND v_next_status = 'cancelled') OR
    (v_current_status = v_next_status)
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition from % to %', v_current_status, v_next_status;
  END IF;

  v_reason := NULLIF(BTRIM(COALESCE(p_reason, '')), '');
  v_internal_notes := CASE
    WHEN NULLIF(BTRIM(COALESCE(p_internal_notes, '')), '') IS NULL THEN v_order.internal_notes
    WHEN COALESCE(BTRIM(v_order.internal_notes), '') = '' THEN NULLIF(BTRIM(p_internal_notes), '')
    ELSE v_order.internal_notes || E'\n' || NULLIF(BTRIM(p_internal_notes), '')
  END;

  UPDATE public.orders
  SET
    status = v_next_status,
    status_updated_at = now(),
    confirmed_at = CASE WHEN v_next_status = 'confirmed' THEN COALESCE(confirmed_at, now()) ELSE confirmed_at END,
    shipping_at = CASE WHEN v_next_status = 'shipping' THEN COALESCE(shipping_at, now()) ELSE shipping_at END,
    delivered_at = CASE WHEN v_next_status = 'delivered' THEN COALESCE(delivered_at, now()) ELSE delivered_at END,
    cancelled_at = CASE WHEN v_next_status = 'cancelled' THEN COALESCE(cancelled_at, now()) ELSE cancelled_at END,
    returned_at = CASE WHEN v_next_status = 'returned' THEN COALESCE(returned_at, now()) ELSE returned_at END,
    cancellation_reason = CASE WHEN v_next_status = 'cancelled' THEN v_reason ELSE cancellation_reason END,
    return_reason = CASE WHEN v_next_status = 'returned' THEN v_reason ELSE return_reason END,
    internal_notes = v_internal_notes
  WHERE id = v_order.id
  RETURNING * INTO v_order;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'status', v_order.status,
    'status_updated_at', v_order.status_updated_at,
    'confirmed_at', v_order.confirmed_at,
    'shipping_at', v_order.shipping_at,
    'delivered_at', v_order.delivered_at,
    'cancelled_at', v_order.cancelled_at,
    'returned_at', v_order.returned_at,
    'cancellation_reason', v_order.cancellation_reason,
    'return_reason', v_order.return_reason,
    'internal_notes', v_order.internal_notes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_order_contact_attempt(
  p_order_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_note TEXT;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF LOWER(COALESCE(v_order.status, '')) <> 'pending_confirmation' THEN
    RAISE EXCEPTION 'Contact attempts can only be recorded for pending confirmation orders';
  END IF;

  v_note := NULLIF(BTRIM(COALESCE(p_note, '')), '');

  UPDATE public.orders
  SET
    confirmation_attempts = COALESCE(confirmation_attempts, 0) + 1,
    last_contact_attempt_at = now(),
    internal_notes = CASE
      WHEN v_note IS NULL THEN internal_notes
      WHEN COALESCE(BTRIM(internal_notes), '') = '' THEN v_note
      ELSE internal_notes || E'\n' || v_note
    END
  WHERE id = v_order.id
  RETURNING * INTO v_order;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'confirmation_attempts', v_order.confirmation_attempts,
    'last_contact_attempt_at', v_order.last_contact_attempt_at,
    'internal_notes', v_order.internal_notes
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_guest_order_confirmation(
  UUID,
  UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_order_status(
  UUID,
  TEXT,
  TEXT,
  TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.record_order_contact_attempt(
  UUID,
  TEXT
) TO authenticated;
