// Credit costs for different features
export const CREDIT_COSTS = {
  text: 2.5,
  image: 3,
  document: 4,
  video: 5,
};

// Plan configurations
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    credits: 10,
    features: {
      text: true,
      textLanguages: ["English"],
      image: true,
      imageLimit: 1,
      video: false,
      document: false,
      aiText: false,
      aiImage: false,
    },
  },
  basic: {
    name: "Basic",
    price: 49,
    credits: 15,
    features: {
      text: true,
      textLanguages: "all",
      image: true,
      imageLimit: "unlimited",
      video: false,
      document: false,
      aiText: false,
      aiImage: false,
    },
  },
  pro: {
    name: "Pro",
    price: 99,
    credits: 35,
    features: {
      text: true,
      textLanguages: "all",
      image: true,
      imageLimit: "unlimited",
      video: true,
      document: false,
      aiText: false,
      aiImage: false,
    },
  },
  premium: {
    name: "Premium",
    price: 199,
    credits: 80,
    features: {
      text: true,
      textLanguages: "all",
      image: true,
      imageLimit: "unlimited",
      video: true,
      document: true,
      aiText: true,
      aiImage: true,
    },
  },
};

export type PlanType = keyof typeof PLANS;

// Calculate total credits needed for a wish
export function calculateWishCredits(hasText: boolean, hasImage: boolean, hasVideo: boolean, hasDocument: boolean): number {
  let total = 0;
  if (hasText) total += CREDIT_COSTS.text;
  if (hasImage) total += CREDIT_COSTS.image;
  if (hasVideo) total += CREDIT_COSTS.video;
  if (hasDocument) total += CREDIT_COSTS.document;
  return total;
}

// Check if user can use a feature based on their plan
export function canUseFeature(plan: PlanType, feature: keyof typeof PLANS["free"]["features"]): boolean {
  const planConfig = PLANS[plan];
  if (!planConfig) return false;
  return Boolean(planConfig.features[feature]);
}

// Check if user has enough credits
export function hasEnoughCredits(userCredits: number, hasText: boolean, hasImage: boolean, hasVideo: boolean, hasDocument: boolean): boolean {
  const required = calculateWishCredits(hasText, hasImage, hasVideo, hasDocument);
  return userCredits >= required;
}

// Get feature restriction message
export function getFeatureRestrictionMessage(plan: PlanType, feature: string): string {
  const planNames: Record<string, string> = {
    video: "Pro",
    document: "Premium",
    aiText: "Premium",
    aiImage: "Premium",
  };
  
  const requiredPlan = planNames[feature] || "Basic";
  return `Upgrade to ${requiredPlan} to unlock this feature`;
}
