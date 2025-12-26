import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

// Format the wish message
function formatMessage(wish: WishData): string {
  const { recipient_name, sender_name, occasion, message_text } = wish;
  
  const occasionEmojis: Record<string, string> = {
    Birthday: '🎂🎉',
    Anniversary: '💍💕',
    Festival: '🎊✨',
    Apology: '🙏💛',
    Appreciation: '🌟💜',
    Congratulations: '🏆🎊',
    'Get Well Soon': '💐🙏',
    'Just Because': '💜✨'
  };

  const emoji = occasionEmojis[occasion] || '✨💜';
  
  if (message_text && message_text.trim()) {
    return `${message_text}\n\nfrom: ${sender_name}`;
  }
  
  return `${emoji} *${occasion} Wishes for ${recipient_name}!* ${emoji}\n\n` +
         `Dear ${recipient_name},\n\n` +
         `Wishing you a wonderful ${occasion.toLowerCase()}! ` +
         `May this special day bring you joy, happiness, and all the love you deserve.\n\n` +
         `from: ${sender_name}\n\n` +
         `_Sent with love via WishBird_ ✨`;
}

// Send text message via WhatsApp Business API
async function sendTextMessage(phone: string, message: string): Promise<any> {
  const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(phone),
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('WhatsApp API Error:', data);
    throw new Error(data.error?.message || 'Failed to send message');
  }
  
  return data;
}

// Send image message via WhatsApp Business API
async function sendImageMessage(phone: string, imageUrl: string, caption: string): Promise<any> {
  const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(phone),
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('WhatsApp API Error:', data);
    throw new Error(data.error?.message || 'Failed to send image');
  }
  
  return data;
}

// Send video message via WhatsApp Business API
async function sendVideoMessage(phone: string, videoUrl: string, caption: string): Promise<any> {
  const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(phone),
      type: 'video',
      video: {
        link: videoUrl,
        caption: caption
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('WhatsApp API Error:', data);
    throw new Error(data.error?.message || 'Failed to send video');
  }
  
  return data;
}

// Send audio message via WhatsApp Business API
async function sendAudioMessage(phone: string, audioUrl: string): Promise<any> {
  const url = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(phone),
      type: 'audio',
      audio: {
        link: audioUrl
      }
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('WhatsApp API Error:', data);
    throw new Error(data.error?.message || 'Failed to send audio');
  }
  
  return data;
}

// Send a complete wish
async function sendWish(wish: WishData): Promise<{ success: boolean; messagesSent: number; errors: string[] | null }> {
  console.log(`📨 Sending wish to ${wish.recipient_name} (${wish.recipient_phone})`);
  console.log(`   Occasion: ${wish.occasion}`);

  const errors: string[] = [];
  let messagesSent = 0;

  try {
    // 1. Send formatted text message
    const formattedMessage = formatMessage(wish);
    try {
      await sendTextMessage(wish.recipient_phone, formattedMessage);
      console.log('   ✅ Text message sent');
      messagesSent++;
    } catch (err: any) {
      console.error('   ❌ Failed to send text:', err.message);
      errors.push(`Text: ${err.message}`);
    }

    // 2. Send greeting card / image
    const imageUrl = wish.greeting_card_url || wish.photo_url;
    if (imageUrl) {
      try {
        const caption = `🎉 *${wish.occasion} Wishes!*\nfrom: ${wish.sender_name}`;
        await sendImageMessage(wish.recipient_phone, imageUrl, caption);
        console.log('   ✅ Image/greeting card sent');
        messagesSent++;
      } catch (err: any) {
        console.error('   ❌ Failed to send image:', err.message);
        errors.push(`Image: ${err.message}`);
      }
    }

    // 3. Send video
    if (wish.video_url) {
      try {
        const caption = `🎬 *Video Message*\nfrom: ${wish.sender_name}`;
        await sendVideoMessage(wish.recipient_phone, wish.video_url, caption);
        console.log('   ✅ Video sent');
        messagesSent++;
      } catch (err: any) {
        console.error('   ❌ Failed to send video:', err.message);
        errors.push(`Video: ${err.message}`);
      }
    }

    // 4. Send audio/voice note
    const audioSrc = wish.audio_url || wish.voice_note_url;
    if (audioSrc) {
      try {
        await sendAudioMessage(wish.recipient_phone, audioSrc);
        console.log('   ✅ Audio/voice note sent');
        messagesSent++;
      } catch (err: any) {
        console.error('   ❌ Failed to send audio:', err.message);
        errors.push(`Audio: ${err.message}`);
      }
    }

    if (messagesSent > 0) {
      console.log(`   📊 Summary: ${messagesSent} message(s) sent successfully`);
      return { success: true, messagesSent, errors: errors.length > 0 ? errors : null };
    } else {
      return { success: false, messagesSent: 0, errors: errors.length > 0 ? errors : ['No content to send'] };
    }

  } catch (error: any) {
    console.error('   ❌ Unexpected error:', error.message);
    return { success: false, messagesSent: 0, errors: [error.message] };
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
    const wishId = body.wishId;

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
      
      // Update wish status
      await supabase
        .from('wishes')
        .update({
          status: result.success ? 'sent' : 'failed',
          delivered_at: result.success ? new Date().toISOString() : null,
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
