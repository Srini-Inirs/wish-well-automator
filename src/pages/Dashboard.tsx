import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { initiatePayment } from "@/lib/razorpay";
import { PLANS, type PlanType } from "@/lib/credits";

import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  Send,
  Trash2,
  User,
  Crown,
  Image,
  Video,
  Mic,
  ArrowRight,
  Edit,
  Phone,
  Mail,
  Coins,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlanSelectDialog } from "@/components/PlanSelectDialog";
import wishbirdLogo from "@/assets/wishbird-logo.png";


interface Wish {
  id: string;
  sender_name: string;
  recipient_name: string;
  recipient_phone: string;
  occasion: string;
  scheduled_date: string;
  language: string;
  message_text: string | null;
  status: string;
  created_at: string;
  photo_url: string | null;
  video_url: string | null;
  voice_note_url: string | null;
}

interface Profile {
  display_name: string | null;
  phone_number: string | null;
  subscription_plan: string;
  wishes_sent_count: number;
  credits: number;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingWishes, setLoadingWishes] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", phoneNumber: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [profileResult, wishesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("wishes").select("*").eq("user_id", user.id).order("scheduled_date", { ascending: true })
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
      setEditForm({
        displayName: profileResult.data.display_name || "",
        phoneNumber: profileResult.data.phone_number || "",
      });
    }
    if (wishesResult.data) setWishes(wishesResult.data);
    if (wishesResult.error) {
      toast({ title: "Error", description: "Failed to load wishes", variant: "destructive" });
    }
    setLoadingWishes(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("wishes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete wish", variant: "destructive" });
    } else {
      setWishes(wishes.filter((w) => w.id !== id));
      toast({ title: "Deleted", description: "Wish removed successfully" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editForm.displayName,
          phone_number: editForm.phoneNumber,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? {
        ...prev,
        display_name: editForm.displayName,
        phone_number: editForm.phoneNumber,
      } : null);

      setIsEditingProfile(false);
      toast({ title: "Profile Updated", description: "Your profile has been saved!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpgrade = async (selectedPlan: "basic" | "pro" | "premium") => {
    if (!user) return;
    setLoadingPlan(selectedPlan);

    try {
      await initiatePayment({
        plan: selectedPlan,
        userId: user.id,
        userEmail: user.email || "",
        userName: profile?.display_name || "",
        onSuccess: (upgradedPlan, credits) => {
          setProfile((prev) => prev ? {
            ...prev,
            subscription_plan: upgradedPlan,
            credits: (prev.credits || 0) + credits,
          } : null);
          toast({
            title: "🎉 Payment Successful!",
            description: `Welcome to ${upgradedPlan.charAt(0).toUpperCase() + upgradedPlan.slice(1)}! ${credits} credits added.`,
          });
          setLoadingPlan(null);
          setShowPlanDialog(false);
        },
        onError: (error) => {
          toast({ title: "Payment Failed", description: error, variant: "destructive" });
          setLoadingPlan(null);
        },
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to initiate payment", variant: "destructive" });
      setLoadingPlan(null);
    }
  };

  const openUpgradeDialog = () => {
    setShowPlanDialog(true);
  };

  const scheduledWishes = wishes.filter((w) => w.status === "scheduled");
  const sentWishes = wishes.filter((w) => w.status === "sent");

  const plan = (profile?.subscription_plan || "free") as PlanType;
  const credits = profile?.credits || 0;

  const getPlanBadge = (planName: string) => {
    switch (planName) {
      case "premium":
        return { label: "Premium", bg: "bg-gradient-to-r from-purple-600 to-pink-500", text: "text-white" };
      case "pro":
        return { label: "Pro", bg: "bg-gradient-to-r from-blue-500 to-cyan-400", text: "text-white" };
      case "basic":
        return { label: "Basic", bg: "bg-gradient-to-r from-green-500 to-emerald-400", text: "text-white" };
      default:
        return { label: "Free", bg: "bg-muted", text: "text-muted-foreground" };
    }
  };

  const planBadge = getPlanBadge(plan);

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
          <Link to="/" className="flex items-center gap-2">
            <img src={wishbirdLogo} alt="WishBird" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-foreground">WishBird</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Personalized Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              👋 Hi, {profile?.display_name || user?.email?.split("@")[0]}
            </h1>
            <p className="text-muted-foreground">
              Let's make someone smile today 💜
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${planBadge.bg} ${planBadge.text}`}>
              {planBadge.label}
            </span>
            {plan !== "premium" && (
              <Button
                variant="hero"
                size="sm"
                onClick={openUpgradeDialog}
                disabled={!!loadingPlan}
              >
                {loadingPlan ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4 mr-1" />
                )}
                Upgrade
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile + Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground">My Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-light flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile?.display_name || "Set your name"}</p>
                    <p className="text-xs text-muted-foreground">Display Name</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-soft flex items-center justify-center">
                    <Mail className="w-5 h-5 text-pink-vibrant" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm truncate max-w-[180px]">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>

                {profile?.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-whatsapp-light flex items-center justify-center">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{profile.phone_number}</p>
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Plan</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${planBadge.bg} ${planBadge.text}`}>
                      {planBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions - Only New Wish */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
            >
              <h3 className="font-bold text-lg text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="hero"
                  className="w-full h-auto py-4 flex items-center justify-center gap-3"
                  onClick={() => navigate("/create-wish")}
                >
                  <Plus className="w-5 h-5" />
                  <span>New Wish</span>
                </Button>
                {plan !== "premium" && (
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex items-center justify-center gap-3 border-gold text-gold hover:bg-gold/10"
                    onClick={openUpgradeDialog}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Crown className="w-5 h-5" />
                    )}
                    <span>Upgrade Plan</span>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Pricing Quick View */}
            {plan !== "premium" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-600/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20"
              >
                <h3 className="font-bold text-lg text-foreground mb-3">💎 Upgrade Benefits</h3>
                <div className="space-y-2 text-sm">
                  {plan === "free" && (
                    <>
                      <p className="text-muted-foreground">✅ Basic: ₹49/mo - All languages, unlimited images</p>
                      <p className="text-muted-foreground">✅ Pro: ₹99/mo - + Video messages</p>
                      <p className="text-muted-foreground">✅ Premium: ₹199/mo - + AI generation, Audio</p>
                    </>
                  )}
                  {plan === "basic" && (
                    <>
                      <p className="text-muted-foreground">✅ Pro: ₹99/mo - + Video messages</p>
                      <p className="text-muted-foreground">✅ Premium: ₹199/mo - + AI generation, Audio</p>
                    </>
                  )}
                  {plan === "pro" && (
                    <p className="text-muted-foreground">✅ Premium: ₹199/mo - + AI generation, Audio</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats + Wishes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-light flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{wishes.length}</div>
                    <div className="text-xs text-muted-foreground">Total Sent</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-soft flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-vibrant" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{scheduledWishes.length}</div>
                    <div className="text-xs text-muted-foreground">Upcoming</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-whatsapp-light flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{sentWishes.length}</div>
                    <div className="text-xs text-muted-foreground">Sent</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{credits}</div>
                    <div className="text-xs text-muted-foreground">Credits Left</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Create Wish CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-cta rounded-2xl p-6 shadow-glow"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold text-primary-foreground mb-1">
                    Ready to Send Some Magic? ✨
                  </h2>
                  <p className="text-primary-foreground/80 text-sm">
                    Create a new wish and make someone's day special!
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/create-wish")}
                  className="bg-card text-foreground hover:bg-card/90 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Wish
                </Button>
              </div>
            </motion.div>

            {/* Upcoming Wishes Timeline */}
            <motion.div
              id="scheduled-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-foreground">📌 Upcoming Wishes</h3>
                {scheduledWishes.length > 0 && (
                  <span className="text-xs text-muted-foreground">{scheduledWishes.length} scheduled</span>
                )}
              </div>

              {loadingWishes ? (
                <div className="text-center py-8">
                  <img src={wishbirdLogo} alt="Loading..." className="w-8 h-8 animate-pulse mx-auto" />
                </div>
              ) : scheduledWishes.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    You have no wishes scheduled yet. Create one now ✨
                  </p>
                  <Button variant="hero" size="sm" onClick={() => navigate("/create-wish")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Your First Wish
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledWishes.slice(0, 5).map((wish) => (
                    <div
                      key={wish.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {wish.occasion === "Birthday" ? "🎂" :
                            wish.occasion === "Anniversary" ? "💍" :
                              wish.occasion === "Festival" ? "🎉" :
                                wish.occasion === "Apology" ? "💛" :
                                  wish.occasion === "Appreciation" ? "🌟" : "✨"}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{wish.recipient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {wish.occasion} • {new Date(wish.scheduled_date).toLocaleDateString()} at {new Date(wish.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {wish.photo_url && <Image className="w-4 h-4 text-muted-foreground" />}
                        {wish.video_url && <Video className="w-4 h-4 text-muted-foreground" />}
                        {wish.voice_note_url && <Mic className="w-4 h-4 text-muted-foreground" />}
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Scheduled
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(wish.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {scheduledWishes.length > 5 && (
                    <Button variant="ghost" className="w-full text-primary" size="sm">
                      View all {scheduledWishes.length} scheduled wishes
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Sent Wishes */}
            {sentWishes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
              >
                <h3 className="font-bold text-lg text-foreground mb-4">✅ Sent Wishes</h3>
                <div className="space-y-3">
                  {sentWishes.slice(0, 5).map((wish) => (
                    <div
                      key={wish.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-accent/20 bg-whatsapp-light"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {wish.occasion === "Birthday" ? "🎂" :
                            wish.occasion === "Anniversary" ? "💍" :
                              wish.occasion === "Festival" ? "🎉" : "✨"}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{wish.recipient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Delivered on {new Date(wish.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                        ✓✓ Sent
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your name"
                value={editForm.displayName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Selection Dialog */}
      <PlanSelectDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        onSelectPlan={handleUpgrade}
        loadingPlan={loadingPlan}
        currentPlan={plan}
      />
    </div>
  );
};

export default Dashboard;
