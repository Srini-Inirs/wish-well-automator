import { Video, FileText } from "lucide-react";
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

interface MessageBubbleProps {
  children: React.ReactNode;
  time: string;
  isFirst?: boolean;
}

const MessageBubble = ({ children, time, isFirst = false }: MessageBubbleProps) => (
  <div className={`bg-card rounded-2xl ${isFirst ? 'rounded-tl-sm' : 'rounded-tl-2xl'} p-3 shadow-md`}>
    {children}
    <div className="flex justify-end mt-2">
      <span className="text-[10px] text-whatsapp font-medium">
        {time} ✓✓
      </span>
    </div>
  </div>
);

const WhatsAppLivePreview = ({
  recipientName,
  senderName,
  occasion,
  language = "English",
  messageText,
  scheduledTime,
  photoPreview,
  photoUrl,
  videoPreview,
  videoUrl,
  documentPreview,
}: WhatsAppLivePreviewProps) => {
  const getOccasionEmoji = () => {
    switch (occasion) {
      case "Birthday": return "🎂✨";
      case "Anniversary": return "💍💜";
      case "Festival": return "🎉✨";
      case "Apology": return "💛🙏";
      case "Appreciation": return "🌟💜";
      case "Congratulations": return "🎊🏆";
      case "Get Well Soon": return "💐🌸";
      default: return "✨💜";
    }
  };

  // Use either preview or url props
  const imageSource = photoPreview || photoUrl;
  const videoSource = videoPreview || videoUrl;
  const hasDocument = !!documentPreview;

  const hasImage = !!imageSource;
  const hasVideo = !!videoSource;

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

  // Determine which templates will be used based on media selection
  const getMessageFlow = () => {
    const messages: Array<{
      type: 'primary' | 'secondary';
      template: string;
      mediaType: 'image' | 'video' | 'document' | 'text';
      includesText: boolean;
    }> = [];

    // Primary template selection (Image > Video > Document > Text)
    if (hasImage) {
      messages.push({ type: 'primary', template: 'wish_text_image', mediaType: 'image', includesText: true });
    } else if (hasVideo) {
      messages.push({ type: 'primary', template: 'wish_text_video', mediaType: 'video', includesText: true });
    } else if (hasDocument) {
      messages.push({ type: 'primary', template: 'wish_text_doc', mediaType: 'document', includesText: true });
    } else {
      messages.push({ type: 'primary', template: 'wish_text', mediaType: 'text', includesText: true });
    }

    // Secondary templates for additional media
    if (hasImage && hasVideo) {
      messages.push({ type: 'secondary', template: 'video_only_temp', mediaType: 'video', includesText: false });
    }
    if ((hasImage || hasVideo) && hasDocument) {
      messages.push({ type: 'secondary', template: 'doc_only_temp', mediaType: 'document', includesText: false });
    }

    return messages;
  };

  const messageFlow = getMessageFlow();

  // Render primary message with full text
  const renderPrimaryMessage = (mediaType: 'image' | 'video' | 'document' | 'text') => (
    <MessageBubble time={scheduledTime || "00:00"} isFirst>
      {/* Media Header */}
      {mediaType === 'image' && imageSource && (
        <div className="rounded-xl overflow-hidden mb-3 -mx-1 -mt-1">
          <img src={imageSource} alt="Attached" className="w-full h-36 object-cover" />
        </div>
      )}
      {mediaType === 'video' && videoSource && (
        <div className="relative rounded-xl overflow-hidden mb-3 -mx-1 -mt-1">
          <video src={videoSource} className="w-full h-36 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
            <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center shadow-lg">
              <Video className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      )}
      {mediaType === 'document' && documentPreview && (
        <div className="rounded-xl border border-border/50 p-3 bg-muted/50 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{documentPreview.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-medium text-[10px]">
                  {getDocumentTypeLabel(documentPreview.type)}
                </span>
                <span>{formatFileSize(documentPreview.size)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Greeting Card */}
      <div className="bg-gradient-to-br from-pink-soft via-secondary to-primary/20 rounded-xl p-4 text-center mb-3">
        <div className="text-2xl mb-1">{getOccasionEmoji()}</div>
        <div className="text-base font-bold text-foreground">
          {occasion || "Special Day"} for {recipientName || "[Recipient]"}!
        </div>
        {language !== "English" && (
          <div className="text-[10px] text-muted-foreground mt-1">
            Language: {language}
          </div>
        )}
      </div>

      {/* Message Text */}
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {messageText || "Your heartfelt message will appear here..."}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground">via WishBird 💜</span>
      </div>
    </MessageBubble>
  );

  // Render video-only secondary message
  const renderVideoOnlyMessage = () => (
    <MessageBubble time={scheduledTime || "00:00"}>
      {/* Video Header */}
      <div className="relative rounded-xl overflow-hidden mb-3 -mx-1 -mt-1">
        <video src={videoSource!} className="w-full h-36 object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
          <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Template Text */}
      <p className="text-sm text-foreground">
        You've received a video from {senderName || "[Sender]"} 💗📸
      </p>
      <p className="text-sm text-foreground mt-2 text-center">
        🌟 Turning moments into memories 🌟
      </p>
    </MessageBubble>
  );

  // Render document-only secondary message
  const renderDocumentOnlyMessage = () => (
    <MessageBubble time={scheduledTime || "00:00"}>
      {/* Document Header */}
      <div className="rounded-xl border border-border/50 p-3 bg-muted/50 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {documentPreview?.name || "Document"}
            </p>
            {documentPreview && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-medium text-[10px]">
                  {getDocumentTypeLabel(documentPreview.type)}
                </span>
                <span>{formatFileSize(documentPreview.size)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Text */}
      <p className="text-sm text-foreground">
        You received a document from {senderName || "[Sender]"} 📄📫
      </p>
      <p className="text-sm text-foreground mt-2 text-center">
        🌟 Turning moments into memories 🌟
      </p>
    </MessageBubble>
  );

  return (
    <div className="bg-foreground/95 rounded-[2rem] p-3 shadow-2xl">
      <div className="bg-whatsapp-light rounded-[1.5rem] overflow-hidden">
        {/* WhatsApp Header */}
        <div className="bg-whatsapp px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center overflow-hidden">
            <img src={wishbirdLogo} alt="WishBird" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1">
            <div className="text-primary-foreground font-semibold text-sm">WishBird</div>
            <div className="text-primary-foreground/70 text-xs">online</div>
          </div>
        </div>

        {/* Chat Area with Scroll */}
        <ScrollArea className="h-[480px]">
          <div 
            className="p-4 space-y-3"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#e5ddd5'
            }}
          >
            {/* Template indicator badge */}
            {messageFlow.length > 1 && (
              <div className="flex justify-center mb-2">
                <span className="text-[10px] bg-card/80 text-muted-foreground px-3 py-1 rounded-full shadow-sm">
                  📨 {messageFlow.length} messages will be sent
                </span>
              </div>
            )}

            {/* Render messages based on flow */}
            {messageFlow.map((msg, index) => (
              <div key={index}>
                {msg.type === 'primary' && renderPrimaryMessage(msg.mediaType)}
                {msg.type === 'secondary' && msg.template === 'video_only_temp' && renderVideoOnlyMessage()}
                {msg.type === 'secondary' && msg.template === 'doc_only_temp' && renderDocumentOnlyMessage()}
              </div>
            ))}

            {/* Spacer for scroll */}
            <div className="h-2" />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default WhatsAppLivePreview;
