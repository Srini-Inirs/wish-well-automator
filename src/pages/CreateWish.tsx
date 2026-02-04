import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MediaUpload from "@/components/MediaUpload";

import WhatsAppLivePreview from "@/components/WhatsAppLivePreview";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MessageSquare,
  Wand2,
  Send,
  Loader2,
  AlertCircle,
  Coins,
} from "lucide-react";
import { CREDIT_COSTS, PLANS, calculateWishCredits, canUseFeature, type PlanType } from "@/lib/credits";
import wishbirdLogo from "@/assets/wishbird-logo.png";


const occasions = [
  "Birthday",
  "Anniversary",
  "Festival",
  "Apology",
  "Appreciation",
  "Congratulations",
  "Get Well Soon",
  "Just Because",
];

const languages = ["English", "Tamil", "Telugu", "Kannada", "Malayalam", "Hindi"];

const CreateWish = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    credits: number;
  } | null>(null);

  // Get current date and time for restrictions
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // Form state
  const [formData, setFormData] = useState({
    senderName: "",
    recipientName: "",
    recipientPhone: "",
    occasion: "",
    scheduledDate: "",
    scheduledTime: "",
    language: "English",
    messageText: "",
  });

  // Media state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<{ name: string; size: number; type: string } | null>(null);

  const plan = (userProfile?.subscription_plan || "free") as PlanType;
  const credits = userProfile?.credits || 0;

  // Calculate credits needed for current wish
  const creditsNeeded = calculateWishCredits(
    !!formData.messageText,
    !!photoFile,
    !!videoFile,
    !!documentFile
  );
  // PRODUCTION MODE: Full restrictions enabled
  const hasEnoughCredits = credits >= creditsNeeded;
  const canSendWish = creditsNeeded === 0 || hasEnoughCredits;

  // Feature access based on plan
  const canUseVideo = canUseFeature(plan, "video");
  const canUseDocument = plan === "premium";
  const canUseAI = plan === "premium";
  const canUseMultiLanguage = plan !== "free";
  const languageRestricted = plan === "free" && formData.language !== "English";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("subscription_plan, credits")
      .eq("user_id", user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (file: File) => {
    // Image limit for free plan
    if (plan === "free" && photoFile) {
      toast({
        title: "Image Limit Reached",
        description: "Free plan allows only 1 image. Upgrade to Basic for unlimited images.",
        variant: "destructive",
      });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (file: File) => {
    if (!canUseVideo) {
      toast({
        title: "Pro Feature 🎥",
        description: "Video messages are available on Pro plan and above.",
        variant: "destructive",
      });
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleDocumentSelect = (file: File) => {
    if (!canUseDocument) {
      toast({
        title: "Premium Feature 📄",
        description: "Document messages are available on Premium plan only.",
        variant: "destructive",
      });
      return;
    }
    setDocumentFile(file);
    setDocumentPreview({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const generateAIMessage = async () => {
    if (!canUseAI) {
      toast({
        title: "Premium Feature 👑",
        description: "AI generation is available on Premium plan (free, no credits!)",
        variant: "destructive",
      });
      return;
    }

    if (!formData.recipientName || !formData.senderName || !formData.occasion) {
      toast({
        title: "Missing Details",
        description: "Please fill in recipient name, your name, and occasion first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-content", {
        body: {
          type: "text",
          recipientName: formData.recipientName,
          senderName: formData.senderName,
          occasion: formData.occasion,
          language: formData.language,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      handleChange("messageText", data.content);
      toast({ title: "AI Magic! ✨", description: "Generated a beautiful message for you!" });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Failed",
        description: "⚠️ Unable to generate wish right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!user) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.senderName || !formData.recipientName || !formData.recipientPhone ||
      !formData.occasion || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: "Missing Fields",
        description: "⚠️ Please fill all required details before scheduling.",
        variant: "destructive",
      });
      return;
    }

    // Check credits
    if (!hasEnoughCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${creditsNeeded} credits but only have ${credits}. Please upgrade your plan.`,
        variant: "destructive",
      });
      return;
    }

    // Check language restriction
    if (languageRestricted) {
      toast({
        title: "Language Restricted",
        description: "Free plan only supports English. Upgrade to Basic for all languages.",
        variant: "destructive",
      });
      return;
    }

    // Check feature access
    if (videoFile && !canUseVideo) {
      toast({
        title: "Video Not Available",
        description: "Video messages require Pro plan or above.",
        variant: "destructive",
      });
      return;
    }

    if (documentFile && !canUseDocument) {
      toast({
        title: "Document Not Available",
        description: "Document messages require Premium plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload media files
      const photoUrl = photoFile ? await uploadFile(photoFile, "wish-photos") : null;
      const videoUrl = videoFile ? await uploadFile(videoFile, "wish-videos") : null;
      const documentUrl = documentFile ? await uploadFile(documentFile, "wish-documents") : null;

      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      // Create wish
      const { error: wishError } = await supabase.from("wishes").insert({
        user_id: user.id,
        sender_name: formData.senderName,
        recipient_name: formData.recipientName,
        recipient_phone: formData.recipientPhone,
        occasion: formData.occasion,
        scheduled_date: scheduledDateTime.toISOString(),
        language: formData.language,
        message_text: formData.messageText,
        photo_url: photoUrl,
        video_url: videoUrl,
        document_url: documentUrl,
        status: "scheduled",
      });

      if (wishError) throw wishError;

      // Deduct credits
      const newCredits = credits - creditsNeeded;
      const { error: creditError } = await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("user_id", user.id);

      if (creditError) {
        console.error("Failed to deduct credits:", creditError);
      }

      toast({
        title: "🎉 Your wish is scheduled successfully!",
        description: `${creditsNeeded} credits used. ${newCredits} credits remaining.`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to schedule wish", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={wishbirdLogo} alt="Loading..." className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3 flex-shrink-0" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Back</span>
              </Button>
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <img src={wishbirdLogo} alt="WishBird" className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0" />
                <span className="font-bold text-base sm:text-lg text-foreground truncate">WishBird</span>
              </Link>
            </div>
            
            {/* Right: Credits + Plan */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <div className="text-xs sm:text-sm bg-muted px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-2">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
                <span className="font-bold text-foreground">{credits}</span>
                <span className="text-muted-foreground hidden xs:inline">credits</span>
              </div>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                {plan}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Credit Warning */}
        {creditsNeeded > 0 && !hasEnoughCredits && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Insufficient Credits</p>
              <p className="text-sm text-muted-foreground">
                You need {creditsNeeded} credits for this wish. You have {credits}.
                <Button variant="link" className="text-primary p-0 h-auto ml-1" onClick={() => navigate("/#pricing")}>
                  Upgrade now
                </Button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Credit Cost Preview */}
        {creditsNeeded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold" />
                <span className="font-medium text-foreground">Credits for this wish:</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gold">{creditsNeeded}</span>
                <span className="text-sm text-muted-foreground ml-1">/ {credits} available</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {formData.messageText && <span className="bg-muted px-2 py-1 rounded">Text: {CREDIT_COSTS.text}</span>}
              {photoFile && <span className="bg-muted px-2 py-1 rounded">Image: +{CREDIT_COSTS.image}</span>}
              {videoFile && <span className="bg-muted px-2 py-1 rounded">Video: +{CREDIT_COSTS.video}</span>}
              {documentFile && <span className="bg-muted px-2 py-1 rounded">Document: +{CREDIT_COSTS.document}</span>}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create a Magical Wish ✨
            </h1>
            <p className="text-muted-foreground mb-8">
              Fill in the details and let WishBird deliver your heartfelt greeting.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="senderName"
                      placeholder="Your name"
                      value={formData.senderName}
                      onChange={(e) => handleChange("senderName", e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient's Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="recipientName"
                      placeholder="Their name"
                      value={formData.recipientName}
                      onChange={(e) => handleChange("recipientName", e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Recipient's WhatsApp Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recipientPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.recipientPhone}
                    onChange={(e) => handleChange("recipientPhone", e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Occasion *</Label>
                  <Select value={formData.occasion} onValueChange={(v) => handleChange("occasion", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occ) => (
                        <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Language
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(v) => handleChange("language", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Schedule Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="scheduledDate"
                      type="date"
                      min={todayStr}
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange("scheduledDate", e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Schedule Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    min={formData.scheduledDate === todayStr ? currentTimeStr : undefined}
                    value={formData.scheduledTime}
                    onChange={(e) => handleChange("scheduledTime", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Your Message
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateAIMessage}
                    disabled={isGenerating}
                    className="text-primary hover:text-primary/80"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-1" />
                    )}
                    AI Generate
                  </Button>
                </Label>
                <Textarea
                  placeholder="Write your heartfelt message here... or let AI help you!"
                  value={formData.messageText}
                  onChange={(e) => handleChange("messageText", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Media Upload */}
              <MediaUpload
                userPlan={plan}
                testingMode={false}
                photoPreview={photoPreview}
                videoPreview={videoPreview}
                documentPreview={documentPreview}
                onPhotoSelect={handlePhotoSelect}
                onVideoSelect={handleVideoSelect}
                onDocumentSelect={handleDocumentSelect}
                onRemovePhoto={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                onRemoveVideo={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                onRemoveDocument={() => {
                  setDocumentFile(null);
                  setDocumentPreview(null);
                }}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting || !canSendWish}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Schedule Wish
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* WhatsApp Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full flex flex-col items-center"
          >
            <div className="lg:sticky lg:top-24 w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                📱 Live Preview
              </h3>
              <WhatsAppLivePreview
                recipientName={formData.recipientName || "Friend"}
                senderName={formData.senderName || "You"}
                occasion={formData.occasion || "Special Day"}
                messageText={formData.messageText}
                photoUrl={photoPreview}
                videoUrl={videoPreview}
                documentPreview={documentPreview}
                scheduledDate={formData.scheduledDate}
                scheduledTime={formData.scheduledTime}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateWish;
