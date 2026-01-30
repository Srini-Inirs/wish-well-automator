import { Video, FileText } from "lucide-react";
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

        {/* Chat */}
        <div className="p-4 min-h-[450px] bg-[#e5ddd5]">
          <div className="bg-card rounded-2xl rounded-tl-sm p-4 shadow-md">
            {/* Photo Preview */}
            {imageSource && (
              <div className="rounded-xl overflow-hidden mb-3">
                <img src={imageSource} alt="Attached" className="w-full h-32 object-cover" />
              </div>
            )}

            {/* Video Preview */}
            {videoSource && (
              <div className="relative rounded-xl overflow-hidden mb-3">
                <video src={videoSource} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                  <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Document Preview */}
            {documentPreview && (
              <div className="rounded-xl border border-border/50 p-3 bg-muted/50 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{documentPreview.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-1 py-0.5 bg-primary/10 rounded text-primary font-medium text-[10px]">
                        {getDocumentTypeLabel(documentPreview.type)}
                      </span>
                      <span>{formatFileSize(documentPreview.size)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Greeting Card Preview */}
            <div className="bg-gradient-to-br from-pink-soft via-secondary to-primary/20 rounded-xl p-4 text-center mb-3">
              <div className="text-3xl mb-2">{getOccasionEmoji()}</div>
              <div className="text-lg font-bold text-foreground">
                {occasion || "Special"} {occasion === "Birthday" ? "Wishes" : ""} for {recipientName || "[Recipient]"}!
              </div>
              {language !== "English" && (
                <div className="text-xs text-muted-foreground mt-1">
                  Language: {language}
                </div>
              )}
            </div>

            <p className="text-sm text-foreground whitespace-pre-wrap">
              {messageText || "Your heartfelt message will appear here..."}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">via WishBird 💜</span>
              <span className="text-xs text-whatsapp">
                {scheduledTime || "00:00"} ✓✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppLivePreview;
