import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "wishbird_webhook_token_2024";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // GET request - Webhook verification from Meta
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("🔐 Webhook verification request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } else {
      console.error("❌ Webhook verification failed - token mismatch");
      return new Response("Forbidden", { status: 403 });
    }
  }

  // POST request - Incoming webhook events
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("📨 Webhook received:", JSON.stringify(body, null, 2));

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Process the webhook payload
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;

            // Handle message status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                console.log(`📊 Message status update: ${status.id} -> ${status.status}`);
                
                // Map WhatsApp status to our status
                let wishStatus = null;
                if (status.status === "sent") {
                  wishStatus = "sent";
                } else if (status.status === "delivered") {
                  wishStatus = "delivered";
                } else if (status.status === "read") {
                  wishStatus = "read";
                } else if (status.status === "failed") {
                  wishStatus = "failed";
                }

                // Update wish status if we can find it
                // Note: We'd need to store message IDs to track this properly
                console.log(`   Status: ${status.status}, Timestamp: ${status.timestamp}`);
                
                if (status.errors) {
                  console.error(`   Errors:`, status.errors);
                }
              }
            }

            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                console.log(`💬 Incoming message from ${message.from}:`);
                console.log(`   Type: ${message.type}`);
                console.log(`   ID: ${message.id}`);
                console.log(`   Timestamp: ${message.timestamp}`);

                if (message.type === "text") {
                  console.log(`   Text: ${message.text?.body}`);
                }

                // Get contact info
                const contact = value.contacts?.find((c: any) => c.wa_id === message.from);
                if (contact) {
                  console.log(`   Contact Name: ${contact.profile?.name}`);
                }

                // You could store incoming messages or trigger auto-replies here
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Webhook processing error:", error);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
