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
  if (cleaned.startsWith('0')) cleaned = '91' + cleaned.substring(1);
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned;
}

async function uploadMediaToMeta(imageUrl: string): Promise<string> {
  console.log(`📤 Downloading image from storage...`);
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
  console.log(`✅ Media uploaded to Meta, ID: ${data.id}`);
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
      name: 'marketing_temp',
      language: { code: 'en_US' },
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

  console.log(`📤 Sending marketing_temp to ${phone}...`);

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
    console.error(`❌ Failed for ${phone}:`, JSON.stringify(data));
    return { phone, success: false, error: data.error?.message || JSON.stringify(data) };
  }

  console.log(`✅ Sent to ${phone}, message ID: ${data.messages?.[0]?.id}`);
  return { phone, success: true, messageId: data.messages?.[0]?.id };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Upload image to Meta
    const mediaId = await uploadMediaToMeta(IMAGE_URL);

    // Step 2: Send to both numbers
    const phones = ['9566848767', '8667487210'];
    const results = [];

    for (const phone of phones) {
      const result = await sendMarketingTemplate(phone, mediaId);
      results.push(result);
    }

    console.log('📊 Results:', JSON.stringify(results));

    return new Response(JSON.stringify({ results }), {
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
