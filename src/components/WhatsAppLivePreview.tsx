import { Video, FileText, Download } from "lucide-react";
import wishbirdLogo from "@/assets/wishbird-logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhatsAppLivePreviewProps {
  recipientName: string;
  senderName: string;
  occasion: string;
  language?: string;
  messageText: string;
  scheduledTime: string;
  scheduledDate?: string;
  photoPreview?: string | null;
  photoUrl?: string | null;
  videoPreview?: string | null;
  videoUrl?: string | null;
  documentPreview?: { name: string; size: number; type: string } | null;
}

const WhatsAppLivePreview = ({
  recipientName,
  senderName,
  occasion,
  messageText,
  scheduledTime,
  photoPreview,
  photoUrl,
  videoPreview,
  videoUrl,
  documentPreview,
}: WhatsAppLivePreviewProps) => {
  const imageSource = photoPreview || photoUrl;
  const videoSource = videoPreview || videoUrl;
  const hasImage = !!imageSource;
  const hasVideo = !!videoSource;
  const hasDocument = !!documentPreview;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
      "text/plain": "TXT",
    };
    return typeMap[type] || "Document";
  };

  // Determine message flow based on selected media
  const getMessageFlow = () => {
    const messages: Array<{
      type: 'primary' | 'video_only' | 'doc_only';
      mediaType: 'image' | 'video' | 'document' | 'text';
    }> = [];

    // Primary template (Image > Video > Document > Text)
    if (hasImage) {
      messages.push({ type: 'primary', mediaType: 'image' });
    } else if (hasVideo) {
      messages.push({ type: 'primary', mediaType: 'video' });
    } else if (hasDocument) {
      messages.push({ type: 'primary', mediaType: 'document' });
    } else {
      messages.push({ type: 'primary', mediaType: 'text' });
    }

    // Secondary templates for additional media
    if (hasImage && hasVideo) {
      messages.push({ type: 'video_only', mediaType: 'video' });
    }
    if ((hasImage || hasVideo) && hasDocument) {
      messages.push({ type: 'doc_only', mediaType: 'document' });
    }

    return messages;
  };

  const messageFlow = getMessageFlow();

  // Primary message with full template body
  const renderPrimaryMessage = (mediaType: 'image' | 'video' | 'document' | 'text') => (
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[85%] shadow-md overflow-hidden">
      {/* Media Header */}
      {mediaType === 'image' && imageSource && (
        <img src={imageSource} alt="Attached" className="w-full h-32 object-cover" />
      )}
      {mediaType === 'video' && videoSource && (
        <div className="relative">
          <video src={videoSource} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Video className="w-5 h-5 text-[#1f2c34]" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
            <Video className="w-3 h-3" />
            <span>0:30</span>
          </div>
        </div>
      )}
      {mediaType === 'document' && documentPreview && (
        <div className="bg-[#182229] p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#374248] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#8696a0]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{documentPreview.name}</p>
            <p className="text-xs text-[#8696a0]">
              {formatFileSize(documentPreview.size)} • {getDocumentTypeLabel(documentPreview.type)}
            </p>
          </div>
          <Download className="w-5 h-5 text-[#8696a0]" />
        </div>
      )}

      {/* Message Body */}
      <div className="p-2.5 space-y-2">
        <p className="text-[13px] text-white leading-relaxed">
          Hello {recipientName || "[Recipient]"} ✨💕
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          You've received a heartfelt wish from {senderName || "[Sender]"} 💐
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          🎊 Occasion: {occasion || "Special Day"}
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          ❤️ Message:{" "}
          {messageText || "Your heartfelt message will appear here..."}
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          ⭐ Turning moments into memories⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2 text-center">
        <span className="text-[#53bdeb] text-sm">↩ Visit website</span>
      </div>
    </div>
  );

  // Video-only secondary message
  const renderVideoOnlyMessage = () => (
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[85%] shadow-md overflow-hidden">
      {/* Video Header */}
      <div className="relative">
        <video src={videoSource!} className="w-full h-32 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Video className="w-5 h-5 text-[#1f2c34]" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
          <Video className="w-3 h-3" />
          <span>0:19</span>
        </div>
      </div>

      {/* Message Body */}
      <div className="p-2.5 space-y-2">
        <p className="text-[13px] text-white leading-relaxed">
          You've received a video from {senderName || "[Sender]"} 💗📸
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          ⭐ Turning moments into memories ⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2 text-center">
        <span className="text-[#53bdeb] text-sm">↩ Thank You</span>
      </div>
    </div>
  );

  // Document-only secondary message
  const renderDocumentOnlyMessage = () => (
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[85%] shadow-md overflow-hidden">
      {/* Document Header */}
      <div className="bg-[#182229] p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-[#374248] flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#8696a0]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">
            {documentPreview?.name || "Document"}
          </p>
          {documentPreview && (
            <p className="text-xs text-[#8696a0]">
              {formatFileSize(documentPreview.size)} • {getDocumentTypeLabel(documentPreview.type)}
            </p>
          )}
        </div>
        <Download className="w-5 h-5 text-[#8696a0]" />
      </div>

      {/* Message Body */}
      <div className="p-2.5 space-y-2">
        <p className="text-[13px] text-white leading-relaxed">
          You received a document from {senderName || "[Sender]"} 📄📫
        </p>
        <p className="text-[13px] text-white leading-relaxed">
          ⭐ Turning moments into memories ⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2 text-center">
        <span className="text-[#53bdeb] text-sm">↗ Thank You</span>
      </div>
    </div>
  );

  return (
    <div className="w-[280px] mx-auto">
      {/* Phone Frame */}
      <div className="bg-[#111b21] rounded-[2rem] p-2 shadow-2xl border-4 border-[#2a3942]">
        {/* Phone Notch */}
        <div className="flex justify-center mb-1">
          <div className="w-20 h-1 bg-[#2a3942] rounded-full" />
        </div>

        {/* WhatsApp UI */}
        <div className="bg-[#0b141a] rounded-[1.5rem] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-cta flex items-center justify-center overflow-hidden">
              <img src={wishbirdLogo} alt="WishBird" className="w-6 h-6 object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm">WishBird</div>
              <div className="text-[#8696a0] text-[10px]">online</div>
            </div>
            <div className="flex gap-4 text-[#8696a0]">
              <span className="text-sm">📹</span>
              <span className="text-sm">📞</span>
              <span className="text-sm">⋮</span>
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea className="h-[400px]">
            <div 
              className="p-3 space-y-2"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0b141a'
              }}
            >
              {/* Date Badge */}
              <div className="flex justify-center mb-2">
                <span className="text-[10px] bg-[#182229] text-[#8696a0] px-2 py-1 rounded">
                  Today
                </span>
              </div>

              {/* Multi-message indicator */}
              {messageFlow.length > 1 && (
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] bg-[#182229] text-[#8696a0] px-2 py-1 rounded">
                    📨 {messageFlow.length} messages will be sent
                  </span>
                </div>
              )}

              {/* Render messages */}
              {messageFlow.map((msg, index) => (
                <div key={index} className="mb-2">
                  {msg.type === 'primary' && renderPrimaryMessage(msg.mediaType)}
                  {msg.type === 'video_only' && renderVideoOnlyMessage()}
                  {msg.type === 'doc_only' && renderDocumentOnlyMessage()}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Bar */}
          <div className="bg-[#1f2c34] px-2 py-2 flex items-center gap-2">
            <span className="text-lg">😊</span>
            <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[#8696a0] text-xs">
              Message
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center">
              <span className="text-white text-sm">🎤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLivePreview;
