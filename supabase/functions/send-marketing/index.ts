import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_API_VERSION = "v24.0";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

const IMAGE_URL = "https://tdkrsgaauvsyvryyzrim.supabase.co/storage/v1/object/public/wish-photos/marketing%2Fwishbird-promo.jpeg";

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // Numbers already have country code (91xxx)
  return cleaned;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadMediaToMeta(imageUrl: string): Promise<string> {
  console.log(`📤 Uploading image to Meta...`);
  const mediaResponse = await fetch(imageUrl);
  if (!mediaResponse.ok) {
    throw new Error(`Failed to download image: ${mediaResponse.status}`);
  }
  const mediaBlob = await mediaResponse.blob();
  console.log(`📥 Downloaded: ${mediaBlob.size} bytes`);

  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', 'image/jpeg');
  formData.append('file', mediaBlob, 'wishbird-promo.jpeg');

  const uploadUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/media`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Media upload failed: ${data.error?.message || JSON.stringify(data)}`);
  }
  console.log(`✅ Media uploaded, ID: ${data.id}`);
  return data.id;
}

async function sendMarketingTemplate(phone: string, mediaId: string): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: 'whats_mark',
      language: { code: 'en' },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'image', image: { id: mediaId } },
          ],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return { phone, success: false, error: data.error?.message || JSON.stringify(data) };
  }

  return { phone, success: true, messageId: data.messages?.[0]?.id };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phones: string[] = body.phones || [];
    const mediaId: string | null = body.mediaId || null;
    const delayMs: number = body.delayMs || 2000;

    if (phones.length === 0) {
      return new Response(JSON.stringify({ error: 'No phones provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload image if no mediaId provided
    const resolvedMediaId = mediaId || await uploadMediaToMeta(IMAGE_URL);

    console.log(`📨 Sending to ${phones.length} contacts with ${delayMs}ms delay...`);

    const results = [];
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      console.log(`[${i + 1}/${phones.length}] Sending to ${phone}...`);
      
      const result = await sendMarketingTemplate(phone, resolvedMediaId);
      results.push(result);
      
      console.log(`   ${result.success ? '✅' : '❌'} ${phone}: ${result.success ? result.messageId : result.error}`);

      // Delay between messages (skip after last one)
      if (i < phones.length - 1) {
        console.log(`   ⏳ Waiting ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`\n📊 Done: ${successCount} sent, ${failCount} failed`);

    return new Response(JSON.stringify({ 
      mediaId: resolvedMediaId,
      total: phones.length,
      success: successCount,
      failed: failCount,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
