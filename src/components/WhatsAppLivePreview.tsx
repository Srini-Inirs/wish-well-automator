import { Video, FileText, Download } from "lucide-react";
import wishbirdLogo from "@/assets/wishbird-logo.png";

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

  const getDocumentExtension = (type: string, name: string): string => {
    // Try to get extension from filename first
    const ext = name.split('.').pop()?.toUpperCase();
    if (ext && ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT'].includes(ext)) {
      return ext;
    }
    // Fallback to MIME type
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
      "text/plain": "TXT",
    };
    return typeMap[type] || "DOC";
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
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[90%] shadow-md overflow-hidden">
      {/* Media Header */}
      {mediaType === 'image' && imageSource && (
        <img src={imageSource} alt="Attached" className="w-full h-40 object-cover" />
      )}
      {mediaType === 'video' && videoSource && (
        <div className="relative">
          <video src={videoSource} className="w-full h-40 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Video className="w-6 h-6 text-[#1f2c34]" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white">
            <Video className="w-3 h-3" />
            <span>0:30</span>
          </div>
        </div>
      )}
      {mediaType === 'document' && documentPreview && (
        <div className="bg-[#182229] p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#374248] flex items-center justify-center relative">
            <FileText className="w-6 h-6 text-[#8696a0]" />
            <span className="absolute -bottom-1 text-[8px] font-bold text-[#00a884] bg-[#1f2c34] px-1 rounded">
              {getDocumentExtension(documentPreview.type, documentPreview.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{documentPreview.name}</p>
            <p className="text-xs text-[#8696a0]">
              {formatFileSize(documentPreview.size)} • {getDocumentExtension(documentPreview.type, documentPreview.name)}
            </p>
          </div>
          <Download className="w-5 h-5 text-[#8696a0]" />
        </div>
      )}

      {/* Message Body */}
      <div className="p-3 space-y-1">
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          Hello {recipientName || "[Recipient]"} ✨💕
        </p>
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          You've received a heartfelt wish from {senderName || "[Sender]"} 💐
        </p>
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          🎊 Occasion: {occasion || "Special Day"}
        </p>
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          ❤️ Message: {messageText || "Your heartfelt message will appear here..."}
        </p>
        <p className="text-[13px] text-white leading-[1.4]">
          ⭐ Turning moments into memories ⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end pt-1">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2.5 text-center">
        <span className="text-[#53bdeb] text-sm font-medium">↩ Visit website</span>
      </div>
    </div>
  );

  // Video-only secondary message
  const renderVideoOnlyMessage = () => (
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[90%] shadow-md overflow-hidden">
      {/* Video Header */}
      <div className="relative">
        <video src={videoSource!} className="w-full h-40 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Video className="w-6 h-6 text-[#1f2c34]" />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white">
          <Video className="w-3 h-3" />
          <span>0:19</span>
        </div>
      </div>

      {/* Message Body */}
      <div className="p-3 space-y-1">
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          You've received a video from {senderName || "[Sender]"} 💗📸
        </p>
        <p className="text-[13px] text-white leading-[1.4]">
          ⭐ Turning moments into memories ⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end pt-1">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2.5 text-center">
        <span className="text-[#53bdeb] text-sm font-medium">↩ Thank You</span>
      </div>
    </div>
  );

  // Document-only secondary message
  const renderDocumentOnlyMessage = () => (
    <div className="bg-[#1f2c34] rounded-lg rounded-tl-sm max-w-[90%] shadow-md overflow-hidden">
      {/* Document Header */}
      <div className="bg-[#182229] p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-[#374248] flex items-center justify-center relative">
          <FileText className="w-6 h-6 text-[#8696a0]" />
          {documentPreview && (
            <span className="absolute -bottom-1 text-[8px] font-bold text-[#00a884] bg-[#1f2c34] px-1 rounded">
              {getDocumentExtension(documentPreview.type, documentPreview.name)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">
            {documentPreview?.name || "Document"}
          </p>
          {documentPreview && (
            <p className="text-xs text-[#8696a0]">
              {formatFileSize(documentPreview.size)} • {getDocumentExtension(documentPreview.type, documentPreview.name)}
            </p>
          )}
        </div>
        <Download className="w-5 h-5 text-[#8696a0]" />
      </div>

      {/* Message Body */}
      <div className="p-3 space-y-1">
        <p className="text-[13px] text-white leading-[1.45] text-left whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          You received a document from {senderName || "[Sender]"} 📄📫
        </p>
        <p className="text-[13px] text-white leading-[1.4]">
          ⭐ Turning moments into memories ⭐
        </p>
        <p className="text-xs text-[#8696a0] italic">
          Crafted with care by -- WishBird
        </p>
        <div className="flex justify-end pt-1">
          <span className="text-[10px] text-[#8696a0]">
            {scheduledTime || "00:00"} <span className="text-[#53bdeb]">✓✓</span>
          </span>
        </div>
      </div>

      {/* Quick Reply Button */}
      <div className="border-t border-[#374248] py-2.5 text-center">
        <span className="text-[#53bdeb] text-sm font-medium">↩ Thank You</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-[360px] mx-auto">
      {/* Phone Frame */}
      <div className="bg-[#111b21] w-full box-border rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-[#2a3942] overflow-hidden">
        {/* Phone Notch */}
        <div className="flex justify-center mb-1.5">
          <div className="w-24 h-1.5 bg-[#2a3942] rounded-full" />
        </div>

        {/* WhatsApp UI */}
        <div className="bg-[#0b141a] rounded-[2rem] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-cta flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={wishbirdLogo} alt="WishBird" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">WishBird</div>
              <div className="text-[#8696a0] text-[11px]">online</div>
            </div>
            <div className="flex gap-3 text-[#8696a0] flex-shrink-0">
              <span className="text-base">📹</span>
              <span className="text-base">📞</span>
              <span className="text-base">⋮</span>
            </div>
          </div>

          {/* Chat Area - Fixed height, no horizontal scroll */}
          <div className="h-[480px] overflow-y-auto overflow-x-hidden">
            <div 
              className="p-3 space-y-3"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0b141a'
              }}
            >
              {/* Date Badge */}
              <div className="flex justify-center mb-3">
                <span className="text-[11px] bg-[#182229] text-[#8696a0] px-3 py-1 rounded-lg">
                  Today
                </span>
              </div>

              {/* Multi-message indicator */}
              {messageFlow.length > 1 && (
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] bg-[#182229]/80 text-[#8696a0] px-2 py-1 rounded">
                    📨 {messageFlow.length} messages will be sent
                  </span>
                </div>
              )}

              {/* Render messages */}
              {messageFlow.map((msg, index) => (
                <div key={index} className="mb-3 overflow-x-hidden">
                  {msg.type === 'primary' && renderPrimaryMessage(msg.mediaType)}
                  {msg.type === 'video_only' && renderVideoOnlyMessage()}
                  {msg.type === 'doc_only' && renderDocumentOnlyMessage()}
                </div>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="bg-[#1f2c34] px-2.5 py-2.5 flex items-center gap-2">
            <span className="text-xl">😊</span>
            <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-[#8696a0] text-sm">
              Message
            </div>
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
              <span className="text-white text-lg">🎤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLivePreview;
