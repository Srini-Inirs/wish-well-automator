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
  Lock,
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const plan = (userProfile?.subscription_plan || "free") as PlanType;
  const credits = userProfile?.credits || 0;

  // Calculate credits needed for current wish
  const creditsNeeded = calculateWishCredits(
    !!formData.messageText,
    !!photoFile,
    !!videoFile,
    !!audioFile
  );
  const hasEnoughCredits = credits >= creditsNeeded;
  const canSendWish = creditsNeeded === 0 || hasEnoughCredits;

  // Feature access
  const canUseVideo = canUseFeature(plan, "video");
  const canUseAudio = plan === "premium";
  const canUseAI = plan === "premium";
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
    // Free plan: only 1 image allowed
    if (plan === "free" && photoFile) {
      toast({
        title: "Image Limit",
        description: "Free plan allows only 1 image. Upgrade to add more!",
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
        title: "Feature Locked 🔒",
        description: "Upgrade to Pro to add video messages!",
        variant: "destructive",
      });
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleAudioSelect = (file: File) => {
    if (!canUseAudio) {
      toast({
        title: "Feature Locked 🔒",
        description: "Upgrade to Premium to add audio messages!",
        variant: "destructive",
      });
      return;
    }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
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

    // ⚠️ TESTING MODE: All restrictions disabled
    // TODO: Re-enable after testing
    // Language restriction for free plan - DISABLED FOR TESTING
    // Video restriction - DISABLED FOR TESTING  
    // Audio restriction - DISABLED FOR TESTING
    // Credit check - DISABLED FOR TESTING

    setIsSubmitting(true);

    try {
      // Upload media files
      const photoUrl = photoFile ? await uploadFile(photoFile, "wish-photos") : null;
      const videoUrl = videoFile ? await uploadFile(videoFile, "wish-videos") : null;
      const audioUrl = audioFile ? await uploadFile(audioFile, "wish-audio") : null;

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
        voice_note_url: audioUrl,
        status: "scheduled",
      });

      if (wishError) throw wishError;

      // ⚠️ TESTING MODE: Credits not deducted
      // TODO: Re-enable after testing
      // const newCredits = credits - creditsNeeded;
      // await supabase
      //   .from("profiles")
      //   .update({ credits: Math.max(0, newCredits) })
      //   .eq("user_id", user.id);

      toast({
        title: "🎉 Your wish is scheduled successfully!",
        description: "Testing mode - no credits deducted.",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <img src={wishbirdLogo} alt="WishBird" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground">WishBird</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm bg-muted px-3 py-1 rounded-full flex items-center gap-2">
              <Coins className="w-4 h-4 text-gold" />
              <span className="font-bold text-foreground">{credits}</span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
              {plan}
            </span>
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
              {audioFile && <span className="bg-muted px-2 py-1 rounded">Audio: +{CREDIT_COSTS.audio}</span>}
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
                    {plan === "free" && (
                      <span className="text-xs text-muted-foreground">(English only on Free)</span>
                    )}
                  </Label>
                  <Select
                    value={formData.language}
                    onValueChange={(v) => handleChange("language", v)}
                    disabled={plan === "free"}
                  >
                    <SelectTrigger className={plan === "free" ? "opacity-60" : ""}>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang} disabled={plan === "free" && lang !== "English"}>
                          {lang} {plan === "free" && lang !== "English" && "🔒"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="scheduledDate"
                      type="date"
                      min={todayStr}
                      value={formData.scheduledDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (newDate < todayStr) return; // Prevent past dates
                        handleChange("scheduledDate", newDate);
                        // Reset time if date changes to today and time is in past
                        if (newDate === todayStr && formData.scheduledTime < currentTimeStr) {
                          handleChange("scheduledTime", "");
                        }
                      }}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    min={formData.scheduledDate === todayStr ? currentTimeStr : undefined}
                    value={formData.scheduledTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      if (formData.scheduledDate === todayStr && newTime < currentTimeStr) {
                        return; // Prevent past time on current day
                      }
                      handleChange("scheduledTime", newTime);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="messageText">Message</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateAIMessage}
                    disabled={isGenerating || !canUseAI}
                    className={canUseAI ? "text-primary" : "text-muted-foreground"}
                  >
                    {!canUseAI && <Lock className="w-3 h-3 mr-1" />}
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-1" />
                        {canUseAI ? "✨ Generate with AI (free)" : "AI (Premium)"}
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="messageText"
                    placeholder="Write your heartfelt message..."
                    value={formData.messageText}
                    onChange={(e) => handleChange("messageText", e.target.value)}
                    rows={6}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Media Upload with restrictions */}
              <div className="space-y-4">
                <Label>Attachments</Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Image - available to all */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${photoPreview ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <>
                          <span className="text-2xl mb-1">🖼️</span>
                          <span className="text-xs text-muted-foreground">Image</span>
                          <span className="text-xs text-primary">+{CREDIT_COSTS.image} credits</span>
                        </>
                      )}
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Video - Pro+ only */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                      className="hidden"
                      id="video-upload"
                      disabled={!canUseVideo}
                    />
                    <label
                      htmlFor="video-upload"
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors ${!canUseVideo
                          ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-60"
                          : videoPreview
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-border hover:border-primary/50 cursor-pointer"
                        }`}
                    >
                      {!canUseVideo && <Lock className="w-4 h-4 text-muted-foreground mb-1" />}
                      <span className="text-2xl mb-1">🎥</span>
                      <span className="text-xs text-muted-foreground">Video</span>
                      {canUseVideo ? (
                        <span className="text-xs text-primary">+{CREDIT_COSTS.video} credits</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pro+</span>
                      )}
                    </label>
                    {videoPreview && (
                      <button
                        type="button"
                        onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Audio - Premium only */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleAudioSelect(e.target.files[0])}
                      className="hidden"
                      id="audio-upload"
                      disabled={!canUseAudio}
                    />
                    <label
                      htmlFor="audio-upload"
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors ${!canUseAudio
                          ? "border-border/30 bg-muted/30 cursor-not-allowed opacity-60"
                          : audioPreview
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-border hover:border-primary/50 cursor-pointer"
                        }`}
                    >
                      {!canUseAudio && <Lock className="w-4 h-4 text-muted-foreground mb-1" />}
                      <span className="text-2xl mb-1">🔊</span>
                      <span className="text-xs text-muted-foreground">Audio</span>
                      {canUseAudio ? (
                        <span className="text-xs text-primary">+{CREDIT_COSTS.audio} credits</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Premium</span>
                      )}
                    </label>
                    {audioPreview && (
                      <button
                        type="button"
                        onClick={() => { setAudioFile(null); setAudioPreview(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
                    Schedule Wish ({creditsNeeded} credits)
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Live Preview 📱</h2>
            <WhatsAppLivePreview
              recipientName={formData.recipientName || "Recipient"}
              senderName={formData.senderName || "Sender"}
              occasion={formData.occasion || "Birthday"}
              language={formData.language}
              messageText={formData.messageText}
              scheduledTime={
                formData.scheduledDate && formData.scheduledTime
                  ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()
                  : undefined
              }
              photoPreview={photoPreview || undefined}
              videoPreview={videoPreview || undefined}
              audioPreview={audioPreview || undefined}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateWish;
