import { Video, Music } from "lucide-react";
import wishbirdLogo from "@/assets/wishbird-logo.png";

interface WhatsAppLivePreviewProps {
  recipientName: string;
  senderName: string;
  occasion: string;
  language: string;
  messageText: string;
  scheduledTime: string;
  photoPreview: string | null;
  videoPreview: string | null;
  audioPreview: string | null;
}

const WhatsAppLivePreview = ({
  recipientName,
  senderName,
  occasion,
  language,
  messageText,
  scheduledTime,
  photoPreview,
  videoPreview,
  audioPreview,
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
            {photoPreview && (
              <div className="rounded-xl overflow-hidden mb-3">
                <img src={photoPreview} alt="Attached" className="w-full h-32 object-cover" />
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <div className="relative rounded-xl overflow-hidden mb-3">
                <video src={videoPreview} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                  <div className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Audio Preview */}
            {audioPreview && (
              <div className="rounded-xl border border-border/50 p-3 bg-whatsapp-light mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-whatsapp flex items-center justify-center">
                    <Music className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-whatsapp rounded-full"
                          style={{ height: `${Math.random() * 16 + 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">0:30</span>
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
