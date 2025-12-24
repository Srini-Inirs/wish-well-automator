import PageLayout from "@/components/PageLayout";

const CookiePolicy = () => {
  return (
    <PageLayout 
      title="Cookie Policy" 
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="prose prose-invert max-w-none space-y-8">
        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences and how you use our service.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">2. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="bg-background/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
              <p className="text-muted-foreground">Required for the website to function properly. These cannot be disabled.</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Authentication Cookies</h3>
              <p className="text-muted-foreground">Keep you logged in and remember your session.</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Preference Cookies</h3>
              <p className="text-muted-foreground">Remember your settings and preferences for a better experience.</p>
            </div>
            <div className="bg-background/50 rounded-xl p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Analytics Cookies</h3>
              <p className="text-muted-foreground">Help us understand how visitors interact with our website.</p>
            </div>
          </div>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cookie Details</h2>
          <div className="bg-background/50 rounded-xl overflow-hidden">
            <table className="w-full text-muted-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Cookie</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Purpose</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">sb-auth-token</td>
                  <td className="py-3 px-4">User authentication</td>
                  <td className="py-3 px-4">Session</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4">preferences</td>
                  <td className="py-3 px-4">User settings</td>
                  <td className="py-3 px-4">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">4. Third-Party Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may use third-party services that set their own cookies, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
            <li>Razorpay for payment processing</li>
            <li>Analytics services to improve our platform</li>
          </ul>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">5. Managing Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can control and manage cookies through your browser settings. Please note that removing or blocking 
            cookies may impact your user experience and some features may not function properly.
          </p>
        </section>

        <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
          <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about our Cookie Policy, contact us at:<br />
            <strong className="text-foreground">Email:</strong> support@16xstudios.space<br />
            <strong className="text-foreground">Phone:</strong> +91 7871282354<br />
            <strong className="text-foreground">Address:</strong> Hosur - 635126, Tamilnadu, India
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default CookiePolicy;
