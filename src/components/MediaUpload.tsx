import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Video, FileText, X, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MediaUploadProps {
  userPlan: "free" | "premium" | "gold";
  /** When true, disables plan/add-on gating and hides upgrade prompts (for end-to-end testing). */
  testingMode?: boolean;
  photoPreview: string | null;
  videoPreview: string | null;
  documentPreview: { name: string; size: number; type: string } | null;
  onPhotoSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onDocumentSelect: (file: File) => void;
  onRemovePhoto: () => void;
  onRemoveVideo: () => void;
  onRemoveDocument: () => void;
  selectedAddOns?: string[];
  disabled?: boolean;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Supported document formats
const DOCUMENT_FORMATS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

const DOCUMENT_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx,.txt";

const MediaUpload = ({
  userPlan,
  testingMode = false,
  photoPreview,
  videoPreview,
  documentPreview,
  onPhotoSelect,
  onVideoSelect,
  onDocumentSelect,
  onRemovePhoto,
  onRemoveVideo,
  onRemoveDocument,
  selectedAddOns = [],
  disabled = false,
}: MediaUploadProps) => {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);

  // Access rules based on plan
  const canUploadImage = testingMode || userPlan === "premium" || userPlan === "gold" || selectedAddOns.includes("image");
  const canUploadVideo = testingMode || userPlan === "gold" || selectedAddOns.includes("video");
  const canUploadDocument = testingMode || userPlan === "gold" || selectedAddOns.includes("document");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video" | "document",
    onSelect: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("❌ File too large. Please upload files under 25 MB.");
      return;
    }

    // Validate document format
    if (type === "document" && !DOCUMENT_FORMATS.includes(file.type)) {
      alert("❌ Invalid document format. Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT");
      return;
    }

    onSelect(file);
  };

  const getMediaAccessInfo = (type: "image" | "video" | "document") => {
    if (testingMode) return { included: true, label: "Included ✓" };
    if (type === "image") {
      if (userPlan === "premium" || userPlan === "gold") return { included: true, label: "Included ✓" };
      if (selectedAddOns.includes("image")) return { included: false, label: "Add-on selected" };
      return { included: false, label: "+₹10" };
    }
    if (type === "video") {
      if (userPlan === "gold") return { included: true, label: "Included ✓" };
      if (selectedAddOns.includes("video")) return { included: false, label: "Add-on selected" };
      return { included: false, label: "+₹29" };
    }
    if (type === "document") {
      if (userPlan === "gold") return { included: true, label: "Included ✓" };
      if (selectedAddOns.includes("document")) return { included: false, label: "Add-on selected" };
      return { included: false, label: "+₹19" };
    }
    return { included: false, label: "" };
  };

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

  const MediaButton = ({
    icon: Icon,
    label,
    onClick,
    hasPreview,
    canAccess,
    accessInfo,
    tooltipText,
  }: {
    icon: typeof ImagePlus;
    label: string;
    onClick: () => void;
    hasPreview: boolean;
    canAccess: boolean;
    accessInfo: { included: boolean; label: string };
    tooltipText: string;
  }) => {
    if (!canAccess) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-16 flex flex-col items-center justify-center gap-1 opacity-60 cursor-not-allowed border-dashed"
                disabled
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium">{label}</span>
                <span className="text-[10px] text-primary font-medium">{accessInfo.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        type="button"
        variant={hasPreview ? "default" : "outline"}
        className="flex-1 h-16 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs font-medium">{label}</span>
        {accessInfo.included && (
          <span className="text-[10px] text-accent font-medium">Included ✓</span>
        )}
      </Button>
    );
  };

  const imageAccess = getMediaAccessInfo("image");
  const videoAccess = getMediaAccessInfo("video");
  const documentAccess = getMediaAccessInfo("document");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          Add Media (Optional)
        </h3>
        {!testingMode && userPlan === "free" && (
          <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">
            💛 Select add-ons below
          </span>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={photoRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFileChange(e, "photo", onPhotoSelect)}
        className="hidden"
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/mp4"
        onChange={(e) => handleFileChange(e, "video", onVideoSelect)}
        className="hidden"
      />
      <input
        ref={documentRef}
        type="file"
        accept={DOCUMENT_EXTENSIONS}
        onChange={(e) => handleFileChange(e, "document", onDocumentSelect)}
        className="hidden"
      />

      {/* Media buttons */}
      <div className="flex gap-2">
        <MediaButton
          icon={ImagePlus}
          label="🖼 Image"
          onClick={() => photoRef.current?.click()}
          hasPreview={!!photoPreview}
          canAccess={canUploadImage}
          accessInfo={imageAccess}
          tooltipText={
            testingMode
              ? "Enabled for testing"
              : userPlan === "free"
                ? "🔒 Add Image add-on (+₹10) or upgrade to Premium"
                : "Available with Premium"
          }
        />
        <MediaButton
          icon={Video}
          label="🎥 Video"
          onClick={() => videoRef.current?.click()}
          hasPreview={!!videoPreview}
          canAccess={canUploadVideo}
          accessInfo={videoAccess}
          tooltipText={
            testingMode
              ? "Enabled for testing"
              : userPlan === "gold"
                ? "Included in Gold"
                : "🔒 Add Video add-on (+₹29) or upgrade to Gold"
          }
        />
        <MediaButton
          icon={FileText}
          label="📄 Document"
          onClick={() => documentRef.current?.click()}
          hasPreview={!!documentPreview}
          canAccess={canUploadDocument}
          accessInfo={documentAccess}
          tooltipText={
            testingMode
              ? "Enabled for testing"
              : userPlan === "gold"
                ? "Included in Gold"
                : "🔒 Add Document add-on (+₹19) or upgrade to Gold"
          }
        />
      </div>

      {/* Compact Previews Grid */}
      {(photoPreview || videoPreview || documentPreview) && (
        <div className="grid grid-cols-3 gap-2">
          {photoPreview && (
            <div className="relative rounded-lg overflow-hidden border border-border aspect-square">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-5 h-5"
                onClick={onRemovePhoto}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {videoPreview && (
            <div className="relative rounded-lg overflow-hidden border border-border aspect-square">
              <video src={videoPreview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                <div className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary" />
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-5 h-5"
                onClick={onRemoveVideo}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {documentPreview && (
            <div className="relative rounded-lg border border-border p-2 bg-muted/50 aspect-square flex flex-col items-center justify-center">
              <FileText className="w-6 h-6 text-primary mb-1" />
              <p className="text-[10px] font-medium text-foreground text-center truncate w-full px-1">
                {documentPreview.name.length > 12 
                  ? documentPreview.name.slice(0, 10) + "..." 
                  : documentPreview.name}
              </p>
              <span className="text-[9px] text-muted-foreground">
                {getDocumentTypeLabel(documentPreview.type)} • {formatFileSize(documentPreview.size)}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-5 h-5"
                onClick={onRemoveDocument}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max 25MB • Image: JPG, PNG, WEBP • Video: MP4 • Document: PDF, DOC, DOCX, PPT, PPTX, TXT
      </p>
    </div>
  );
};

export default MediaUpload;
