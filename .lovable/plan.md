
# WhatsApp Cloud API Template-Based Messaging System

## Overview
This plan implements a complete WhatsApp Cloud API integration using Meta's official template messages for reliable message delivery. The system will support:
- **Text-only messages** using a text template
- **Image messages** with uploaded media header
- **Video messages** with uploaded media header  
- **Document messages** with uploaded media header

All templates use the same body format with 4 variables:
1. Recipient's name
2. Sender's name
3. Occasion
4. Custom message

## Configuration Updates

### Step 1: Update Secrets
Save the new WhatsApp credentials:
- **WHATSAPP_ACCESS_TOKEN**: `EAANFRMGKYEQBQl8sX7f8dT2wZCtpTqZBZBiQRzouBVdv1ssZAYuKPCDug5iFv3EIZCalZAjtOUxXKBXv1oeoIzoR6ZAaeuqkqKbRLORBanqmUUafnprZByJe5q1LGbqBGw1tv7TkC0RoiubTpSngAqru3hrxesFJnHNc4QrMZBxrXrPqe6sT8oasuopNvGCauhgZDZD`
- **WHATSAPP_PHONE_NUMBER_ID**: `1010840835436380`

### Step 2: Add New Template Configuration Secrets
Add these template name secrets for flexibility:
- `WHATSAPP_TEXT_TEMPLATE` - Name of text-only template
- `WHATSAPP_IMAGE_TEMPLATE` - Name of image template
- `WHATSAPP_VIDEO_TEMPLATE` - Name of video template
- `WHATSAPP_DOCUMENT_TEMPLATE` - Name of document template

## Database Changes

### Step 3: Add Media ID Storage Column
Add a column to store uploaded WhatsApp media IDs for scheduled wishes:

```sql
ALTER TABLE wishes 
ADD COLUMN IF NOT EXISTS whatsapp_media_id TEXT DEFAULT NULL;
```

This stores the Meta-uploaded media ID when a wish with media is scheduled, so it can be reused at send time.

## Edge Function Rewrite

### Step 4: Rewrite `send-whatsapp-message/index.ts`

The edge function will be completely rewritten with these new capabilities:

#### 4.1 Configuration Constants
```typescript
const WHATSAPP_API_VERSION = "v24.0";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

// Template names (configured in Meta Business Suite)
const TEMPLATE_TEXT = Deno.env.get('WHATSAPP_TEXT_TEMPLATE') ?? 'wishbird_text';
const TEMPLATE_IMAGE = Deno.env.get('WHATSAPP_IMAGE_TEMPLATE') ?? 'wishbird_image';
const TEMPLATE_VIDEO = Deno.env.get('WHATSAPP_VIDEO_TEMPLATE') ?? 'wishbird_video';
const TEMPLATE_DOCUMENT = Deno.env.get('WHATSAPP_DOCUMENT_TEMPLATE') ?? 'wishbird_document';
const TEMPLATE_LANGUAGE = "en";
```

#### 4.2 Upload Media to Meta Function
```typescript
async function uploadMediaToMeta(
  mediaUrl: string, 
  mimeType: string
): Promise<string> {
  // 1. Download media from Supabase storage
  const mediaResponse = await fetch(mediaUrl);
  const mediaBlob = await mediaResponse.blob();
  
  // 2. Upload to Meta's servers
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('file', mediaBlob, 'media');
  formData.append('type', mimeType);
  
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
    throw new Error(`Media upload failed: ${data.error?.message}`);
  }
  
  return data.id; // Returns WhatsApp media ID
}
```

#### 4.3 Send Text-Only Template Message
```typescript
async function sendTextTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
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
      type: 'template',
      template: {
        name: TEMPLATE_TEXT,
        language: { code: TEMPLATE_LANGUAGE },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: recipientName },    // {{1}}
              { type: 'text', text: senderName },       // {{2}}
              { type: 'text', text: occasion },         // {{3}}
              { type: 'text', text: messageText || 'Wishing you all the best!' }, // {{4}}
            ],
          },
        ],
      },
    }),
  });
  
  return await response.json();
}
```

#### 4.4 Send Image Template Message
```typescript
async function sendImageTemplateMessage(
  phone: string,
  recipientName: string,
  senderName: string,
  occasion: string,
  messageText: string,
  mediaId: string
): Promise<any> {
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
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
    }),
  });
  
  return await response.json();
}
```

#### 4.5 Send Video Template Message
Similar structure to image but with `video` type in header.

#### 4.6 Send Document Template Message
Similar structure but with `document` type in header.

#### 4.7 Main sendWish Function Logic
```typescript
async function sendWish(wish: WishData): Promise<SendResult> {
  const { recipient_phone, recipient_name, sender_name, occasion, message_text } = wish;
  const messageBody = message_text || 'Wishing you all the best!';
  
  let result;
  
  // Determine which template to use based on media
  const imageUrl = wish.greeting_card_url || wish.photo_url;
  const videoUrl = wish.video_url;
  const audioUrl = wish.audio_url || wish.voice_note_url;
  
  if (videoUrl) {
    // Upload video to Meta and send video template
    const mediaId = await uploadMediaToMeta(videoUrl, 'video/mp4');
    result = await sendVideoTemplateMessage(
      recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
    );
  } else if (imageUrl) {
    // Upload image to Meta and send image template
    const mediaId = await uploadMediaToMeta(imageUrl, 'image/jpeg');
    result = await sendImageTemplateMessage(
      recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
    );
  } else if (audioUrl) {
    // Upload audio and send document template (audio as attachment)
    const mediaId = await uploadMediaToMeta(audioUrl, 'audio/mpeg');
    result = await sendDocumentTemplateMessage(
      recipient_phone, recipient_name, sender_name, occasion, messageBody, mediaId
    );
  } else {
    // Text-only template
    result = await sendTextTemplateMessage(
      recipient_phone, recipient_name, sender_name, occasion, messageBody
    );
  }
  
  return processResult(result);
}
```

## Template Variables Mapping

The templates in Meta Business Suite should have these exact variable placeholders:

```text
Template Body:
Hello {{1}} ✨💖
You've received a heartfelt wish from {{2}} 💐
🎉 Occasion: {{3}}
💌 Message:
{{4}}
🌟 Turning moments into memories🌟
```

Where:
- `{{1}}` = Recipient's name (`recipient_name`)
- `{{2}}` = Sender's name (`sender_name`)
- `{{3}}` = Occasion (`occasion`)
- `{{4}}` = Custom message (`message_text`)

## Implementation Steps Summary

| Step | Action | Details |
|------|--------|---------|
| 1 | Update secrets | New access token and phone number ID |
| 2 | Add template name secrets | 4 new secrets for template names |
| 3 | Database migration | Add `whatsapp_media_id` column |
| 4 | Rewrite edge function | Complete template-based messaging |
| 5 | Test flow | Send test wish and verify delivery |

## Technical Details

### API Endpoints Used
- **Upload Media**: `POST https://graph.facebook.com/v24.0/{phone-id}/media`
- **Send Message**: `POST https://graph.facebook.com/v24.0/{phone-id}/messages`

### Media Upload Flow
```text
User uploads → Supabase Storage → Edge Function downloads → 
Upload to Meta → Get media_id → Use in template header
```

### Error Handling
- Media upload failures: Fallback to text-only template
- Template not found: Log error with template name
- API rate limits: 1 second delay between messages

## Pre-requisites (User Action Required)

Before the code can work, you need to create these templates in Meta Business Suite:

1. **Text Template** (name: `wishbird_text`)
   - Body with 4 variables

2. **Image Template** (name: `wishbird_image`)
   - Header: Image
   - Body with 4 variables

3. **Video Template** (name: `wishbird_video`)
   - Header: Video
   - Body with 4 variables

4. **Document Template** (name: `wishbird_document`)
   - Header: Document
   - Body with 4 variables

All templates use the same body text with the 4 variables as specified above.
