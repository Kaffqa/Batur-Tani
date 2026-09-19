import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");

    const { transaction_details, credit_card, customer_details } = await req.json();

    if (!transaction_details?.order_id || !transaction_details?.gross_amount) {
      throw new Error("transaction_details (order_id, gross_amount) are required");
    }

    // Call Midtrans Snap API
    const encodedKey = btoa(serverKey + ':');

    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedKey}`,
      },
      body: JSON.stringify({
        transaction_details,
        credit_card: credit_card || { secure: true },
        customer_details: customer_details || {},
      }),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      console.error("Midtrans error:", midtransData);
      throw new Error(midtransData?.error_messages?.[0] || "Midtrans API error");
    }

    return new Response(
      JSON.stringify(midtransData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
