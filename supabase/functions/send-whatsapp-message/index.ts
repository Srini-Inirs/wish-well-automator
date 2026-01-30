import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // Match headers sent by the web client (prevents CORS preflight failures)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// WhatsApp Cloud API Configuration
const WHATSAPP_API_VERSION = "v24.0";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Template names (hardcoded as per Meta Business Suite)
// Primary templates (with full text body: recipient, sender, occasion, message)
const TEMPLATE_TEXT = 'wish_text';
const TEMPLATE_IMAGE = 'wish_text_image';
const TEMPLATE_VIDEO = 'wish_text_video';
const TEMPLATE_DOCUMENT = 'wish_text_doc';

// Secondary templates (for additional media, only sender_name in body)
const TEMPLATE_VIDEO_ONLY = 'video_only_temp';
const TEMPLATE_DOC_ONLY = 'doc_only_temp';

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
  document_url: string | null;
  language: string;
}

// Format phone number for WhatsApp API (remove + and any spaces)
function formatPhoneNumber(phone: string): string {
  return phone.replace(/[\s+\-()]/g, '');
}

// Sanitize text for WhatsApp template parameters
// WhatsApp rejects: newlines, tabs, and 4+ consecutive spaces
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\r\n\t]/g, ' ')          // Replace newlines/tabs with single space
    .replace(/\s{4,}/g, '   ')          // Replace 4+ spaces with 3 spaces
    .replace(/\s+/g, ' ')               // Normalize multiple spaces to single
    .trim();                            // Trim leading/trailing
}

// Detect MIME type from URL - improved to handle URLs without extensions
function getMimeType(url: string): string {
  const lower = url.toLowerCase();
  
  // Video formats
  if (lower.includes('.mp4') || lower.includes('video')) return 'video/mp4';
  if (lower.includes('.mov')) return 'video/quicktime';
  if (lower.includes('.avi')) return 'video/x-msvideo';
  
  // Document formats
  if (lower.includes('.pdf')) return 'application/pdf';
  if (lower.includes('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.includes('.doc')) return 'application/msword';
  if (lower.includes('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (lower.includes('.ppt')) return 'application/vnd.ms-powerpoint';
  if (lower.includes('.txt')) return 'text/plain';
  
  // Image formats - check extensions first
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  
  // Common image hosting services - default to JPEG
  const imageHosts = ['unsplash.com', 'imgur.com', 'pexels.com', 'pixabay.com', 'cloudinary.com', 'images.'];
  if (imageHosts.some(host => lower.includes(host))) {
    return 'image/jpeg';
  }
  
  // If URL path contains 'image' or 'photo', assume JPEG
  if (lower.includes('/image') || lower.includes('/photo') || lower.includes('img')) {
    return 'image/jpeg';
  }
  
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

// Send image template message (primary - includes full text)
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

// Send video template message (primary - includes full text)
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

// Send document template message (primary - includes full text)
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

// Send video-only template (secondary - only sender_name in body)
// Template: video_only_temp
// Body: "You've received a video from {{1}} 💗📸\n\n🌟 Turning moments into memories 🌟"
async function sendVideoOnlyTemplateMessage(
  phone: string,
  senderName: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_VIDEO_ONLY,
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
            { type: 'text', text: senderName }, // {{1}} - sender name
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending video-only template: ${TEMPLATE_VIDEO_ONLY}`);
  
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

// Send document-only template (secondary - only sender_name in body)
// Template: doc_only_temp
// Body: "You received a document from {{1}} 📄📫\n\n🌟 Turning moments into memories 🌟"
async function sendDocumentOnlyTemplateMessage(
  phone: string,
  senderName: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatPhoneNumber(phone),
    type: 'template',
    template: {
      name: TEMPLATE_DOC_ONLY,
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
            { type: 'text', text: senderName }, // {{1}} - sender name
          ],
        },
      ],
    },
  };

  console.log(`   📤 Sending document-only template: ${TEMPLATE_DOC_ONLY}`);
  
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

// Main function to send a wish using appropriate template(s)
// Implements multi-template logic for multiple media types
async function sendWish(
  wish: WishData
): Promise<{ success: boolean; messagesSent: number; errors: string[] | null; primaryMessageId: string | null; allMessageIds: string[] }> {
  console.log(`\n📨 Sending wish to ${wish.recipient_name} (${wish.recipient_phone})`);
  console.log(`   Occasion: ${wish.occasion}`);

  const { recipient_phone } = wish;
  
  // Sanitize all text parameters to prevent WhatsApp API errors
  const recipient_name = sanitizeText(wish.recipient_name);
  const sender_name = sanitizeText(wish.sender_name);
  const occasion = sanitizeText(wish.occasion);
  const messageBody = sanitizeText(wish.message_text || '') || 'Wishing you all the best!';

  const imageUrl = wish.greeting_card_url || wish.photo_url;
  const videoUrl = wish.video_url;
  const documentUrl = wish.document_url;

  // Determine which media types are present
  const hasImage = !!imageUrl;
  const hasVideo = !!videoUrl;
  const hasDocument = !!documentUrl;

  console.log(`   📊 Media analysis: Image=${hasImage}, Video=${hasVideo}, Document=${hasDocument}`);

  const errors: string[] = [];
  const allMessageIds: string[] = [];
  let primaryMessageId: string | null = null;
  let messagesSent = 0;

  try {
    // ============================================
    // STEP 1: Send PRIMARY template (includes full text)
    // Priority: Image > Video > Document > Text-only
    // ============================================
    
    if (hasImage) {
      // PRIMARY: Image template (with full text body)
      console.log('   🖼️ PRIMARY: Sending image template with full text');
      const mimeType = getMimeType(imageUrl);
      const mediaId = await uploadMediaToMeta(imageUrl, mimeType);
      const result = await sendImageTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
      primaryMessageId = extractMessageId(result);
      allMessageIds.push(primaryMessageId!);
      messagesSent++;
      console.log(`   ✅ Primary image message sent! ID: ${primaryMessageId}`);
      
    } else if (hasVideo) {
      // PRIMARY: Video template (with full text body)
      console.log('   🎬 PRIMARY: Sending video template with full text');
      const mimeType = getMimeType(videoUrl);
      const mediaId = await uploadMediaToMeta(videoUrl, mimeType);
      const result = await sendVideoTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
      primaryMessageId = extractMessageId(result);
      allMessageIds.push(primaryMessageId!);
      messagesSent++;
      console.log(`   ✅ Primary video message sent! ID: ${primaryMessageId}`);
      
    } else if (hasDocument) {
      // PRIMARY: Document template (with full text body)
      console.log('   📄 PRIMARY: Sending document template with full text');
      const mimeType = getMimeType(documentUrl);
      const mediaId = await uploadMediaToMeta(documentUrl, mimeType);
      const result = await sendDocumentTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
      );
      primaryMessageId = extractMessageId(result);
      allMessageIds.push(primaryMessageId!);
      messagesSent++;
      console.log(`   ✅ Primary document message sent! ID: ${primaryMessageId}`);
      
    } else {
      // PRIMARY: Text-only template
      console.log('   📝 PRIMARY: Sending text-only template');
      const result = await sendTextTemplateMessage(
        recipient_phone, recipient_name, sender_name, occasion, messageBody
      );
      primaryMessageId = extractMessageId(result);
      allMessageIds.push(primaryMessageId!);
      messagesSent++;
      console.log(`   ✅ Primary text message sent! ID: ${primaryMessageId}`);
    }

    // Small delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));

    // ============================================
    // STEP 2: Send SECONDARY templates for additional media
    // These use simpler templates with just sender_name
    // ============================================
    
    // If image was primary and video exists, send video_only_temp
    if (hasImage && hasVideo) {
      console.log('   🎬 SECONDARY: Sending video-only template');
      try {
        const mimeType = getMimeType(videoUrl);
        const mediaId = await uploadMediaToMeta(videoUrl, mimeType);
        const result = await sendVideoOnlyTemplateMessage(recipient_phone, sender_name, mediaId);
        const msgId = extractMessageId(result);
        allMessageIds.push(msgId!);
        messagesSent++;
        console.log(`   ✅ Secondary video message sent! ID: ${msgId}`);
      } catch (err: any) {
        console.error(`   ❌ Failed to send secondary video: ${err.message}`);
        errors.push(`Secondary video: ${err.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // If video was primary (no image) and document exists, send doc_only_temp
    if (!hasImage && hasVideo && hasDocument) {
      console.log('   📄 SECONDARY: Sending document-only template');
      try {
        const mimeType = getMimeType(documentUrl);
        const mediaId = await uploadMediaToMeta(documentUrl, mimeType);
        const result = await sendDocumentOnlyTemplateMessage(recipient_phone, sender_name, mediaId);
        const msgId = extractMessageId(result);
        allMessageIds.push(msgId!);
        messagesSent++;
        console.log(`   ✅ Secondary document message sent! ID: ${msgId}`);
      } catch (err: any) {
        console.error(`   ❌ Failed to send secondary document: ${err.message}`);
        errors.push(`Secondary document: ${err.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // If image was primary and document exists, send doc_only_temp
    if (hasImage && hasDocument) {
      console.log('   📄 SECONDARY: Sending document-only template');
      try {
        const mimeType = getMimeType(documentUrl);
        const mediaId = await uploadMediaToMeta(documentUrl, mimeType);
        const result = await sendDocumentOnlyTemplateMessage(recipient_phone, sender_name, mediaId);
        const msgId = extractMessageId(result);
        allMessageIds.push(msgId!);
        messagesSent++;
        console.log(`   ✅ Secondary document message sent! ID: ${msgId}`);
      } catch (err: any) {
        console.error(`   ❌ Failed to send secondary document: ${err.message}`);
        errors.push(`Secondary document: ${err.message}`);
      }
    }

    console.log(`\n   📊 SUMMARY: ${messagesSent} message(s) sent, ${errors.length} error(s)`);
    
    return {
      success: messagesSent > 0,
      messagesSent,
      errors: errors.length > 0 ? errors : null,
      primaryMessageId,
      allMessageIds,
    };

  } catch (error: any) {
    console.error(`   ❌ Failed to send wish: ${error.message}`);
    return {
      success: false,
      messagesSent,
      errors: [error.message, ...errors],
      primaryMessageId,
      allMessageIds,
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
      // Idempotency: only send if we can atomically "claim" the wish.
      // This prevents double-sends from cron + manual triggers (or concurrent runs).
      const claimTime = new Date().toISOString();

      const { data: claimed, error: claimError } = await supabase
        .from('wishes')
        .update({
          status: 'sending',
          whatsapp_status: 'sending',
          whatsapp_status_updated_at: claimTime,
        })
        .eq('id', wishId)
        .eq('status', 'scheduled')
        .select('*');

      if (claimError) {
        throw new Error(`Failed to claim wish: ${claimError.message}`);
      }

      const wish = claimed?.[0];
      if (!wish) {
        // Either does not exist or already processed/claimed
        return new Response(
          JSON.stringify({ success: false, error: 'Wish already sent/being sent (idempotency guard).' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
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

    // Idempotent scheduler: claim due wishes first so parallel invocations can't double-send.
    const { data: dueWishes, error: claimDueError } = await supabase
      .from('wishes')
      .update({
        status: 'sending',
        whatsapp_status: 'sending',
        whatsapp_status_updated_at: now,
      })
      .eq('status', 'scheduled')
      .lte('scheduled_date', now)
      .select('*');

    if (claimDueError) {
      throw new Error(`Failed to claim wishes: ${claimDueError.message}`);
    }

    console.log(`📋 Claimed ${dueWishes?.length || 0} wishes to send`);

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
