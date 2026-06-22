import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createClient();
    const productId = params.productId;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        id,
        order:orders!inner(
          user_id,
          status,
          demo_download
        ),
        product:products!inner(
          id,
          download_file_path,
          file_size_bytes,
          file_type,
          is_paid_product
        )
      `)
      .eq('product_id', productId)
      .eq('order.user_id', user.id)
      .eq('order.status', 'completed')
      .single();

    if (orderError || !orderItems) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const product = orderItems.product as any;
    const order = orderItems.order as any;

    if (order.demo_download) {
      const { data: publicUrl } = supabase.storage
        .from('product-files')
        .getPublicUrl(product.download_file_path);
      return NextResponse.json({ url: publicUrl.publicUrl });
    }

    if (product.is_paid_product && !order.demo_download) {
      const { data: signedUrl, error: signedError } = supabase.storage
        .from('product-files')
        .createSignedUrl(product.download_file_path, 60);

      if (signedError || !signedUrl) {
        return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
      }

      return NextResponse.json({ url: signedUrl.signedUrl });
    }

    return NextResponse.json({ error: 'File not available' }, { status: 404 });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}