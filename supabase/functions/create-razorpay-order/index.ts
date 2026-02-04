import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PRODUCTION PRICES
const PLANS = {
  basic: { amount: 4900, credits: 15 },    // ₹49
  pro: { amount: 9900, credits: 35 },      // ₹99
  premium: { amount: 19900, credits: 80 }, // ₹199
};

// Quick top-up options (only for paid users)
const TOP_UPS = {
  topup10: { amount: 3000, credits: 10 },  // ₹30 for 10 credits
  topup15: { amount: 4500, credits: 15 },  // ₹45 for 15 credits (best value)
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, userId, isTopUp } = await req.json();

    // Handle top-up purchases
    if (isTopUp) {
      const topUpDetails = TOP_UPS[plan as keyof typeof TOP_UPS];
      if (!topUpDetails) {
        return new Response(
          JSON.stringify({ error: "Invalid top-up option" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
      const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return new Response(
          JSON.stringify({ error: "Payment service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const receipt = `topup_${Date.now()}`;
      const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      
      const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: topUpDetails.amount,
          currency: "INR",
          receipt,
          notes: { plan, user_id: userId, credits: topUpDetails.credits, is_topup: true },
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Razorpay order creation failed:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create payment order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const order = await orderResponse.json();
      return new Response(
        JSON.stringify({
          orderId: order.id,
          amount: topUpDetails.amount,
          currency: "INR",
          keyId: RAZORPAY_KEY_ID,
          plan,
          credits: topUpDetails.credits,
          isTopUp: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle plan purchases
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    // Receipt max 40 chars - use shortened format
    const receipt = `${plan}_${Date.now()}`;

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: planDetails.amount,
        currency: "INR",
        receipt,
        notes: {
          plan,
          user_id: userId,
          credits: planDetails.credits,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderResponse.json();
    console.log("Razorpay order created:", order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: planDetails.amount,
        currency: "INR",
        keyId: RAZORPAY_KEY_ID,
        plan,
        credits: planDetails.credits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
