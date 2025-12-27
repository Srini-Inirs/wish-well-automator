-- Track WhatsApp delivery statuses on wishes
ALTER TABLE public.wishes
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_status TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_status_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_error JSONB;

-- Helpful index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_wishes_whatsapp_message_id ON public.wishes (whatsapp_message_id);