import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Image,
  Video,
  FileText,
  Sparkles,
  Zap,
  Lock
} from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  price: number;
  icon: typeof Image;
  description: string;
  includedIn: ("premium" | "gold")[];
  availableFor: ("free" | "premium" | "gold")[];
}

const addOns: AddOn[] = [
  {
    id: "image",
    name: "Add Image",
    price: 10,
    icon: Image,
    description: "Upload 1 image (JPG/PNG/WEBP, ≤25MB)",
    includedIn: ["premium", "gold"],
    availableFor: ["free", "premium", "gold"],
  },
  {
    id: "premium_card",
    name: "Premium Card Design",
    price: 15,
    icon: Sparkles,
    description: "Unlock premium greeting card styles",
    includedIn: ["gold"],
    availableFor: ["premium", "gold"],
  },
  {
    id: "document",
    name: "Document Attachment",
    price: 19,
    icon: FileText,
    description: "Attach PDF, DOC, DOCX, PPT, PPTX, or TXT (≤25MB)",
    includedIn: ["gold"],
    availableFor: ["premium", "gold"],
  },
  {
    id: "video",
    name: "Video Greeting",
    price: 29,
    icon: Video,
    description: "Animated greeting video (MP4)",
    includedIn: ["gold"],
    availableFor: ["premium", "gold"],
  },
  {
    id: "urgent",
    name: "Urgent Delivery",
    price: 9,
    icon: Zap,
    description: "Send within 30 seconds, skip queue",
    includedIn: [],
    availableFor: ["free", "premium", "gold"],
  },
];

interface AddOnsSectionProps {
  userPlan: "free" | "premium" | "gold";
  selectedAddOns: string[];
  onToggleAddOn: (addOnId: string) => void;
  disabled?: boolean;
}

const AddOnsSection = ({
  userPlan,
  selectedAddOns,
  onToggleAddOn,
  disabled = false
}: AddOnsSectionProps) => {
  const isIncluded = (addOn: AddOn) => addOn.includedIn.includes(userPlan as "premium" | "gold");
  const isAvailable = (addOn: AddOn) => addOn.availableFor.includes(userPlan);
  const isSelected = (addOnId: string) => selectedAddOns.includes(addOnId);

  const getButtonLabel = (addOn: AddOn) => {
    if (isIncluded(addOn)) {
      return "Included ✓";
    }
    if (!isAvailable(addOn)) {
      return "Not Available";
    }
    if (isSelected(addOn.id)) {
      return "Remove";
    }
    return `+₹${addOn.price}`;
  };

  const getInclusionLabel = (addOn: AddOn) => {
    if (addOn.includedIn.includes("premium") && addOn.includedIn.includes("gold")) {
      return "Free with Premium & Gold 💛";
    }
    if (addOn.includedIn.includes("gold")) {
      return "Included in Gold 💛";
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft"
    >
      <h3 className="text-lg font-bold text-foreground mb-1">
        Add-ons (Optional)
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enhance your wish with premium features
      </p>

      <div className="space-y-3">
        {addOns.map((addOn) => {
          const included = isIncluded(addOn);
          const available = isAvailable(addOn);
          const selected = isSelected(addOn.id);
          const inclusionLabel = getInclusionLabel(addOn);

          return (
            <div
              key={addOn.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selected && !included
                ? "border-primary bg-indigo-light"
                : included
                  ? "border-accent/30 bg-whatsapp-light"
                  : !available
                    ? "border-border/30 bg-muted/30 opacity-60"
                    : "border-border/50 hover:border-primary/30"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${included ? "bg-accent/20" :
                  !available ? "bg-muted" :
                    selected ? "bg-primary/20" : "bg-indigo-light"
                  }`}>
                  {!available ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <addOn.icon className={`w-5 h-5 ${included ? "text-accent" :
                      selected ? "text-primary" : "text-primary"
                      }`} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {addOn.name} {addOn.id === "image" && "🖼"}
                    {addOn.id === "video" && "🎥"}
                    {addOn.id === "document" && "📄"}
                    {addOn.id === "premium_card" && "✨"}
                    {addOn.id === "urgent" && "⚡"}
                    {!included && available && ` (+₹${addOn.price})`}
                  </p>
                  <p className="text-xs text-muted-foreground">{addOn.description}</p>
                  {inclusionLabel && !included && (
                    <p className="text-xs text-gold font-medium mt-0.5">{inclusionLabel}</p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant={included ? "ghost" : selected ? "secondary" : "outline"}
                size="sm"
                disabled={disabled || included || !available}
                onClick={() => !included && available && onToggleAddOn(addOn.id)}
                className={`text-xs ${included ? "text-accent cursor-default" :
                  !available ? "text-muted-foreground cursor-not-allowed" :
                    selected ? "bg-secondary text-secondary-foreground" : ""
                  }`}
              >
                {getButtonLabel(addOn)}
              </Button>
            </div>
          );
        })}
      </div>

      {selectedAddOns.length > 0 && userPlan === "free" && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Add-on total:</span>
            <span className="font-bold text-primary">
              ₹{selectedAddOns.reduce((total, id) => {
                const addOn = addOns.find(a => a.id === id);
                return total + (addOn?.price || 0);
              }, 0)}
            </span>
          </div>
        </div>
      )}

      {userPlan === "free" && (
        <p className="text-xs text-muted-foreground mt-3">
          🔒 Media sharing is available for subscribed users. Add-ons unlock for this wish only.
        </p>
      )}
    </motion.div>
  );
};

export default AddOnsSection;
