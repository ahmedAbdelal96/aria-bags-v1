-- ARIA guest checkout stabilization
-- Forward-only migration for databases that may already have applied 006.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone_2 TEXT;

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
  v_confirmation_token UUID := gen_random_uuid();
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
    customer_email,
    customer_phone,
    customer_phone_2,
    shipping_city,
    notes,
    status,
    total_amount,
    payment_method,
    shipping_address
  )
  VALUES (
    v_order_id,
    NULL,
    v_confirmation_token,
    p_customer_name,
    NULL,
    p_customer_phone,
    NULLIF(p_customer_phone_2, ''),
    NULL,
    NULLIF(p_notes, ''),
    'pending',
    0,
    'cod',
    jsonb_build_object(
      'full_name', p_customer_name,
      'phone', p_customer_phone,
      'phone_2', NULLIF(p_customer_phone_2, ''),
      'address', p_shipping_address,
      'notes', NULLIF(p_notes, '')
    )
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
    AND confirmation_token = p_confirmation_token
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
    'customer_email', v_order.customer_email,
    'customer_phone', v_order.customer_phone,
    'customer_phone_2', v_order.customer_phone_2,
    'shipping_city', v_order.shipping_city,
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

GRANT EXECUTE ON FUNCTION public.create_guest_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_guest_order_confirmation(UUID, UUID) TO anon, authenticated;
