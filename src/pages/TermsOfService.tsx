import PageLayout from "@/components/PageLayout";

const TermsOfService = () => {
  return (
    <PageLayout 
      title="Terms of Service" 
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="prose prose-invert max-w-none space-y-8">
        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using WishBird, you accept and agree to be bound by the terms and conditions of this agreement. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            WishBird provides an automated WhatsApp messaging service that allows users to schedule and send personalized 
            greetings for birthdays, anniversaries, and other occasions. The service includes AI-generated messages, 
            media attachments, and scheduled delivery.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>You must provide accurate recipient information</li>
            <li>You are responsible for obtaining consent from recipients</li>
            <li>You agree not to use the service for spam or harassment</li>
            <li>You must comply with WhatsApp's terms of service</li>
            <li>You are responsible for the content of your messages</li>
          </ul>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Credits and Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            WishBird operates on a credit-based system. Credits are non-refundable once purchased. 
            Each wish sent consumes credits based on your subscription plan. Payments are processed securely through Razorpay.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
            Message delivery depends on WhatsApp's availability and the recipient's phone status. 
            We are not responsible for failed deliveries due to invalid phone numbers or network issues.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            WishBird and 16xstudios shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of the service. Our total liability shall not exceed 
            the amount paid by you in the last 12 months.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modifications to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the service after changes 
            constitutes acceptance of the new terms. We will notify users of significant changes via email.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Service, contact us at:<br />
            <strong className="text-foreground">Email:</strong> support@16xstudios.space<br />
            <strong className="text-foreground">Phone:</strong> +91 7871282354<br />
            <strong className="text-foreground">Address:</strong> Hosur - 635126, Tamilnadu, India
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default TermsOfService;
