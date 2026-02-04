import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  plan: "basic" | "pro" | "premium" | "topup10" | "topup15";
  userId: string;
  userEmail: string;
  userName?: string;
  isTopUp?: boolean;
  onSuccess: (plan: string, credits: number, isTopUp?: boolean) => void;
  onError: (error: string) => void;
}

export async function initiatePayment({
  plan,
  userId,
  userEmail,
  userName,
  isTopUp = false,
  onSuccess,
  onError,
}: PaymentOptions) {
  try {
    // Create order via edge function
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: { plan, userId, isTopUp },
    });

    if (error || data?.error) {
      throw new Error(data?.error || error?.message || "Failed to create order");
    }

    const { orderId, amount, keyId, credits } = data;

    // Load Razorpay script if not loaded
    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });
    }

    const planLabel = isTopUp 
      ? `Quick Top-up - ${credits} Credits`
      : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${credits} Credits`;

    const options = {
      key: keyId,
      amount,
      currency: "INR",
      name: "WishBird",
      description: planLabel,
      order_id: orderId,
      handler: async function (response: any) {
        try {
          // Verify payment
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            "verify-razorpay-payment",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                userId,
                isTopUp,
              },
            }
          );

          if (verifyError || verifyData?.error) {
            throw new Error(verifyData?.error || "Payment verification failed");
          }

          onSuccess(plan, credits, isTopUp);
        } catch (err) {
          onError(err instanceof Error ? err.message : "Payment verification failed");
        }
      },
      prefill: {
        email: userEmail,
        name: userName || "",
      },
      theme: {
        color: "#7c3aed",
      },
      modal: {
        ondismiss: function () {
          onError("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Payment failed");
  }
}
