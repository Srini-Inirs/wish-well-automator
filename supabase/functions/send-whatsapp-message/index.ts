import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WhatsApp Cloud API Configuration
const WHATSAPP_API_VERSION = "v24.0";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Template names (hardcoded as per Meta Business Suite)
const TEMPLATE_TEXT = 'wish_text';
const TEMPLATE_IMAGE = 'wish_text_image';
const TEMPLATE_VIDEO = 'wish_text_video';
const TEMPLATE_DOCUMENT = 'wish_text_doc';
const TEMPLATE_LANGUAGE = 'en';

interface WishData {
  id: string;
  recipient_phone: string;
  recipient_name: string;
  sender_name: string;
  occasion: string;
  message_text: string | null;
  photo_url: string | null;
  greeting_card_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  voice_note_url: string | null;
  language: string;
}

// Format phone number for WhatsApp API (remove + and any spaces)
function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s+\-()]/g, '');
}

// Detect MIME type from URL
function getMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.mp4') || lower.includes('video')) return 'video/mp4';
  if (lower.includes('.mp3')) return 'audio/mpeg';
  if (lower.includes('.wav')) return 'audio/wav';
  if (lower.includes('.pdf')) return 'application/pdf';
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

// Upload media to Meta's servers and get media ID
async function uploadMediaToMeta(mediaUrl: string, mimeType: string): Promise<string> {
  console.log(`   📤 Uploading media to Meta: ${mediaUrl.substring(0, 50)}...`);
  console.log(`   📤 MIME type: ${mimeType}`);
  
  // 1. Download media from Supabase storage
  const mediaResponse = await fetch(mediaUrl);
  if (!mediaResponse.ok) {
    throw new Error(`Failed to download media: ${mediaResponse.status} ${mediaResponse.statusText}`);
  }
  
  const mediaBlob = await mediaResponse.blob();
  console.log(`   📥 Downloaded media: ${mediaBlob.size} bytes`);
  
  // 2. Upload to Meta's servers
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', mimeType);
  
  // Create a proper file with extension
  const extension = mimeType.split('/')[1] || 'bin';
  const fileName = `media.${extension}`;
  formData.append('file', mediaBlob, fileName);
  
  const uploadUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/media`;
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('   ❌ Media upload failed:', data);
    throw new Error(`Media upload failed: ${data.error?.message || JSON.stringify(data)}`);
  }
  
  console.log(`   ✅ Media uploaded, ID: ${data.id}`);
  return data.id;
}

// Send text-only template message
async function sendTextTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_TEXT,
      language: { code: TEMPLATE_LANGUAGE },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName },
            { type: 'text', text: senderName },
            { type: 'text', text: occasion },
            { type: 'text', text: messageText || 'Wishing you all the best!' },
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending text template: ${TEMPLATE_TEXT}`);
  
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
    console.error('   ❌ WhatsApp API Error:', data);
    throw new Error(`WhatsApp API error: ${data.error?.message || JSON.stringify(data)}`);
  }
  
  return data;
}

// Send image template message
async function sendImageTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_IMAGE,
      language: { code: TEMPLATE_LANGUAGE },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'image', image: { id: mediaId } },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName },
            { type: 'text', text: senderName },
            { type: 'text', text: occasion },
            { type: 'text', text: messageText || 'Wishing you all the best!' },
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending image template: ${TEMPLATE_IMAGE}`);
  
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
    console.error('   ❌ WhatsApp API Error:', data);
    throw new Error(`WhatsApp API error: ${data.error?.message || JSON.stringify(data)}`);
  }
  
  return data;
}

// Send video template message
async function sendVideoTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_VIDEO,
      language: { code: TEMPLATE_LANGUAGE },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'video', video: { id: mediaId } },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName },
            { type: 'text', text: senderName },
            { type: 'text', text: occasion },
            { type: 'text', text: messageText || 'Wishing you all the best!' },
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending video template: ${TEMPLATE_VIDEO}`);
  
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
    console.error('   ❌ WhatsApp API Error:', data);
    throw new Error(`WhatsApp API error: ${data.error?.message || JSON.stringify(data)}`);
  }
  
  return data;
}

// Send document template message (for audio files)
async function sendDocumentTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_DOCUMENT,
      language: { code: TEMPLATE_LANGUAGE },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'document', document: { id: mediaId } },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: recipientName },
            { type: 'text', text: senderName },
            { type: 'text', text: occasion },
            { type: 'text', text: messageText || 'Wishing you all the best!' },
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending document template: ${TEMPLATE_DOCUMENT}`);
  
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
    console.error('   ❌ WhatsApp API Error:', data);
    throw new Error(`WhatsApp API error: ${data.error?.message || JSON.stringify(data)}`);
  }
  
  return data;
}

function extractMessageId(result: any): string | null {
  return result?.messages?.[0]?.id ?? null;
}

// Main function to send a wish using appropriate template
async function sendWish(
  wish: WishData
): Promise<{ success: boolean; messagesSent: number; errors: string[] | null; primaryMessageId: string | null }> {
  console.log(`\n📨 Sending wish to ${wish.recipient_name} (${wish.recipient_phone})`);
  console.log(`   Occasion: ${wish.occasion}`);

  const { recipient_phone, recipient_name, sender_name, occasion, message_text } = wish;
  const messageBody = message_text || 'Wishing you all the best!';

  try {
    let result: any;
    
    // Determine which template to use based on media priority: video > image > audio > text
    const imageUrl = wish.greeting_card_url || wish.photo_url;
    const videoUrl = wish.video_url;
    const audioUrl = wish.audio_url || wish.voice_note_url;
    
    if (videoUrl) {
      // Upload video and send video template
      console.log('   🎬 Wish has video, using video template');
      const mimeType = getMimeType(videoUrl);
      const mediaId = await uploadMediaToMeta(videoUrl, mimeType);
      result = await sendVideoTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
    } else if (imageUrl) {
      // Upload image and send image template
      console.log('   🖼️ Wish has image, using image template');
      const mimeType = getMimeType(imageUrl);
      const mediaId = await uploadMediaToMeta(imageUrl, mimeType);
      result = await sendImageTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
    } else if (audioUrl) {
      // Upload audio and send document template
      console.log('   🎵 Wish has audio, using document template');
      const mimeType = getMimeType(audioUrl);
      const mediaId = await uploadMediaToMeta(audioUrl, mimeType);
      result = await sendDocumentTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
    } else {
      // Text-only template
      console.log('   📝 Text-only wish, using text template');
      result = await sendTextTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody
      );
    }
    
    const messageId = extractMessageId(result);
    console.log(`   ✅ Message sent successfully! ID: ${messageId}`);
    
    return {
      success: true,
      messagesSent: 1,
      errors: null,
      primaryMessageId: messageId,
    };

  } catch (error: any) {
    console.error(`   ❌ Failed to send wish: ${error.message}`);
    return {
      success: false,
      messagesSent: 0,
      errors: [error.message],
      primaryMessageId: null,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Check if this is a scheduled run or a specific wish ID
    const body = await req.json().catch(() => ({}));
    const { wishId, testMessage, phone, message } = body;

    // Handle direct test message (text template only)
    if (testMessage && phone && message) {
      console.log(`📤 Sending test message to ${phone}`);
      try {
        const result = await sendTextTemplateMessage(
          phone,
          'Friend',           // recipient_name
          'WishBird',         // sender_name
          'Test',             // occasion
          message             // message_text
        );
        const messageId = extractMessageId(result);
        console.log('✅ Test message sent successfully');
        return new Response(JSON.stringify({ success: true, type: 'template', messageId, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        console.error('❌ Test message failed:', error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (wishId) {
      // Send a specific wish
      const { data: wish, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('id', wishId)
        .single();

      if (error || !wish) {
        throw new Error(`Wish not found: ${wishId}`);
      }

      const result = await sendWish(wish as WishData);

      // Update wish status + WhatsApp tracking
      await supabase
        .from('wishes')
        .update({
          status: result.success ? 'sent' : 'failed',
          delivered_at: result.success ? new Date().toISOString() : null,
          whatsapp_message_id: result.primaryMessageId,
          whatsapp_status: result.success ? 'sent' : 'failed',
          whatsapp_status_updated_at: new Date().toISOString(),
          whatsapp_error: result.errors ? { errors: result.errors } : null,
        })
        .eq('id', wishId);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for scheduled wishes that are due
    const now = new Date().toISOString();
    console.log(`🔍 Checking for scheduled wishes at ${now}`);

    const { data: dueWishes, error: fetchError } = await supabase
      .from('wishes')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_date', now);

    if (fetchError) {
      throw new Error(`Failed to fetch wishes: ${fetchError.message}`);
    }

    console.log(`📋 Found ${dueWishes?.length || 0} wishes to send`);

    const results = [];
    
    for (const wish of dueWishes || []) {
      const result = await sendWish(wish as WishData);

      // Update wish status in database
      await supabase
        .from('wishes')
        .update({
          status: result.success ? 'sent' : 'failed',
          delivered_at: result.success ? new Date().toISOString() : null,
          whatsapp_message_id: result.primaryMessageId,
          whatsapp_status: result.success ? 'sent' : 'failed',
          whatsapp_status_updated_at: new Date().toISOString(),
          whatsapp_error: result.errors ? { errors: result.errors } : null,
        })
        .eq('id', wish.id);

      results.push({
        wishId: wish.id,
        recipientName: wish.recipient_name,
        ...result,
      });

      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({
      processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-whatsapp-message function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
