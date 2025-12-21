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
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import MediaUpload from "@/components/MediaUpload";
import WhatsAppLivePreview from "@/components/WhatsAppLivePreview";
import {
  Sparkles,
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MessageSquare,
  Wand2,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

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

const FREE_WISH_LIMIT = 2;

const CreateWish = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    wishes_sent_count: number;
  } | null>(null);

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

  const isSubscribed = userProfile?.subscription_plan !== "free";
  const wishesRemaining = FREE_WISH_LIMIT - (userProfile?.wishes_sent_count || 0);
  const canSendWish = isSubscribed || wishesRemaining > 0;

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
      .select("subscription_plan, wishes_sent_count")
      .eq("user_id", user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleAudioSelect = (file: File) => {
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };

  const generateAIMessage = async () => {
    if (!canSendWish) {
      toast({
        title: "Limit Reached",
        description: "You've used your 2 free wishes. Upgrade to continue.",
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
      const { data, error } = await supabase.functions.invoke("generate-wish", {
        body: {
          recipientName: formData.recipientName,
          senderName: formData.senderName,
          occasion: formData.occasion,
          language: formData.language,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      handleChange("messageText", data.wish);
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

    if (!canSendWish) {
      toast({
        title: "Limit Reached",
        description: "🎉 You've used your 2 free wishes. Upgrade your account to continue sending magical wishes.",
        variant: "destructive",
      });
      return;
    }

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

      // Update wish count for free users
      if (!isSubscribed) {
        await supabase
          .from("profiles")
          .update({ wishes_sent_count: (userProfile?.wishes_sent_count || 0) + 1 })
          .eq("user_id", user.id);
      }

      toast({
        title: "🎉 Your wish is scheduled successfully!",
        description: "We'll deliver it with love at the perfect moment.",
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
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
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
              <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">WishBot</span>
            </Link>
          </div>
          {!isSubscribed && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Free wishes left: <span className="font-bold text-primary">{Math.max(0, wishesRemaining)}</span> / {FREE_WISH_LIMIT}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Limit Warning */}
        {!canSendWish && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">🎉 You've used your 2 free wishes.</p>
              <p className="text-sm text-muted-foreground">
                Upgrade your account to continue sending magical wishes.
              </p>
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
              Fill in the details and let WishBot deliver your heartfelt greeting.
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
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(v) => handleChange("language", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
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
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange("scheduledDate", e.target.value)}
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
                    value={formData.scheduledTime}
                    onChange={(e) => handleChange("scheduledTime", e.target.value)}
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
                    disabled={isGenerating || !canSendWish}
                    className="text-primary"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-1" />
                        ✨ Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="messageText"
                    placeholder="Write your heartfelt message or use AI to generate one..."
                    value={formData.messageText}
                    onChange={(e) => handleChange("messageText", e.target.value)}
                    rows={6}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <MediaUpload
                userPlan={userProfile?.subscription_plan === "gold" ? "gold" : userProfile?.subscription_plan === "premium" ? "premium" : "free"}
                photoPreview={photoPreview}
                videoPreview={videoPreview}
                audioPreview={audioPreview}
                onPhotoSelect={handlePhotoSelect}
                onVideoSelect={handleVideoSelect}
                onAudioSelect={handleAudioSelect}
                onRemovePhoto={() => { setPhotoFile(null); setPhotoPreview(null); }}
                onRemoveVideo={() => { setVideoFile(null); setVideoPreview(null); }}
                onRemoveAudio={() => { setAudioFile(null); setAudioPreview(null); }}
                disabled={!canSendWish}
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
                    Schedule Wish ✨
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              Live WhatsApp Preview 📱
            </h2>
            <WhatsAppLivePreview
              recipientName={formData.recipientName}
              senderName={formData.senderName}
              occasion={formData.occasion}
              language={formData.language}
              messageText={formData.messageText}
              scheduledTime={formData.scheduledTime}
              photoPreview={photoPreview}
              videoPreview={videoPreview}
              audioPreview={audioPreview}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateWish;
