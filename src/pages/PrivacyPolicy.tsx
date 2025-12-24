import PageLayout from "@/components/PageLayout";

const PrivacyPolicy = () => {
  return (
    <PageLayout 
      title="Privacy Policy" 
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="prose prose-invert max-w-none space-y-8">
        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            WishBird ("we", "our", or "us"), operated by 16xstudios, is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
          <p className="text-muted-foreground mb-3">We collect information you provide directly:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Account information (name, email, phone number)</li>
            <li>Recipient details (name, phone number)</li>
            <li>Message content and media uploads</li>
            <li>Payment information (processed securely via Razorpay)</li>
          </ul>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>To deliver scheduled WhatsApp messages</li>
            <li>To process payments and manage subscriptions</li>
            <li>To improve our services</li>
            <li>To communicate with you about your account</li>
          </ul>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate security measures to protect your personal information. 
            Your data is encrypted in transit and at rest. We never share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your data for as long as your account is active. Message content is deleted 30 days after delivery. 
            You can request deletion of your account and data at any time.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy, contact us at:<br />
            <strong className="text-foreground">Email:</strong> support@16xstudios.space<br />
            <strong className="text-foreground">Phone:</strong> +91 7871282354<br />
            <strong className="text-foreground">Address:</strong> Hosur - 635126, Tamilnadu, India
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
