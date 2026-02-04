import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLANS = {
  basic: { credits: 15 },
  pro: { credits: 35 },
  premium: { credits: 80 },
};

const TOP_UPS = {
  topup10: { credits: 10 },
  topup15: { credits: 15 },
};

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return generatedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userId, isTopUp } = await req.json();

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      console.error("Invalid payment signature");
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment verified successfully:", razorpay_payment_id);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle top-up purchases
    if (isTopUp) {
      const topUpDetails = TOP_UPS[plan as keyof typeof TOP_UPS];
      if (!topUpDetails) {
        return new Response(
          JSON.stringify({ error: "Invalid top-up option" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const topUpAmounts = { topup10: 3000, topup15: 4500 };
      
      // Record payment
      await supabase.from("payments").insert({
        user_id: userId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: topUpAmounts[plan as keyof typeof topUpAmounts],
        currency: "INR",
        plan: `topup_${topUpDetails.credits}`,
        credits_purchased: topUpDetails.credits,
        status: "completed",
      });

      // Get current credits and add top-up
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", userId)
        .single();

      const currentCredits = profile?.credits || 0;

      await supabase
        .from("profiles")
        .update({ credits: currentCredits + topUpDetails.credits })
        .eq("user_id", userId);

      console.log(`User ${userId} topped up ${topUpDetails.credits} credits`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Top-up successful",
          creditsAdded: topUpDetails.credits,
          isTopUp: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle plan purchases
    const planDetails = PLANS[plan as keyof typeof PLANS];

    if (!planDetails) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PRODUCTION PRICES
    const planAmounts = { basic: 4900, pro: 9900, premium: 19900 };
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: planAmounts[plan as keyof typeof planAmounts] || 4900,
      currency: "INR",
      plan,
      credits_purchased: planDetails.credits,
      status: "completed",
    });

    if (paymentError) {
      console.error("Error recording payment:", paymentError);
    }

    // Update user profile with new plan and credits
    const planExpiresAt = new Date();
    planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);

    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (profileFetchError) {
      console.error("Error fetching profile:", profileFetchError);
    }

    const currentCredits = profile?.credits || 0;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_plan: plan,
        credits: currentCredits + planDetails.credits,
        plan_expires_at: planExpiresAt.toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${userId} upgraded to ${plan} with ${planDetails.credits} credits`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and subscription updated",
        plan,
        creditsAdded: planDetails.credits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
