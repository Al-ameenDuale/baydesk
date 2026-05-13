import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/LegalDocLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | BayDesk",
  description: "How BayDesk collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalDocLayout title="Privacy Policy">
      <section>
        <p className="text-zinc-600">
          BayDesk (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy
          explains what information we collect when you use our shop management software
          and related services (the &quot;Service&quot;), how we use it, and your choices.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">1. Information we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
          <li>
            <strong>Account data:</strong> such as your name, email address, and
            authentication details needed to create and secure your account.
          </li>
          <li>
            <strong>Billing data:</strong> such as billing address and payment-related
            information. Card and payment details are typically collected and stored by our
            payment processors (for example, Paddle), not on our servers.
          </li>
          <li>
            <strong>Shop and operational data:</strong> information you enter into the
            Service, such as customer names, contact details, vehicle information, job
            descriptions, invoices, and other records you choose to store.
          </li>
          <li>
            <strong>Technical data:</strong> such as IP address, browser type, device
            information, and logs that help us operate, secure, and improve the Service.
          </li>
          <li>
            <strong>Support communications:</strong> messages you send us when you contact
            support.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">2. How we use your information</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
          <li>To provide, maintain, and secure the Service and your account.</li>
          <li>To process subscriptions, trials, and payments.</li>
          <li>
            To communicate with you about the Service, including transactional messages,
            security alerts, and (where permitted) product updates.
          </li>
          <li>
            To improve reliability and develop new features (for example, using aggregated
            or de-identified usage patterns where appropriate).
          </li>
          <li>To comply with legal obligations and enforce our terms.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">3. Who we share information with</h2>
        <p className="mt-3 text-zinc-700">
          We share data only as needed to run the Service and as described below:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
          <li>
            <strong>Supabase</strong> — for authentication, database storage, and related
            infrastructure that hosts your account and shop data.
          </li>
          <li>
            <strong>Paddle and other payment processors</strong> — to process subscriptions,
            trials, taxes where applicable, and billing. Paddle or another processor may act
            as merchant of record depending on how you subscribe.
          </li>
          <li>
            <strong>Twilio</strong> — if you use or we offer SMS-related features, message
            delivery may be handled by Twilio or a similar communications provider.
          </li>
          <li>
            <strong>Hosting and infrastructure</strong> — for example, our application hosting
            provider (such as Vercel) may process technical logs needed to deliver the site.
          </li>
          <li>
            <strong>Legal and safety</strong> — we may disclose information if required by
            law, to protect rights and safety, or in connection with a business transfer
            (for example, a merger) subject to appropriate safeguards.
          </li>
        </ul>
        <p className="mt-3 text-zinc-700">
          We do not sell your personal information. We do not allow third-party advertising
          networks to track you across unrelated sites for ad targeting through BayDesk.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">4. Data security</h2>
        <p className="mt-3 text-zinc-700">
          We use industry-standard practices to protect your information, including encrypted
          connections (HTTPS) between your browser and our application, and access controls
          on our systems. Where we use Supabase, we configure Row Level Security (RLS) so
          that authenticated users can access only their own shop data, subject to your
          schema and policies. No method of transmission or storage is 100% secure; we
          encourage strong passwords and protecting your devices.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">5. Retention and your rights</h2>
        <p className="mt-3 text-zinc-700">
          We retain information for as long as your account is active and as needed to
          provide the Service, comply with law, resolve disputes, and enforce our
          agreements. Depending on where you live, you may have rights to access, correct,
          export, or delete your personal information, or to object to certain processing.
          You can request account or data deletion by contacting us at the email below. We
          will respond within a reasonable timeframe and may need to verify your identity.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">6. Cookies and analytics</h2>
        <p className="mt-3 text-zinc-700">
          We use cookies and similar technologies that are necessary for authentication,
          session management, and basic security. We do not use third-party advertising
          cookies or cross-site behavioral tracking for ads. If we use product analytics,
          it is limited to understanding how the Service is used so we can improve it, and
          we avoid collecting sensitive shop content for analytics where possible.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">7. International transfers</h2>
        <p className="mt-3 text-zinc-700">
          Our service providers may process data in countries other than your own. Where
          required, we rely on appropriate safeguards such as standard contractual clauses
          or equivalent mechanisms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">8. Children&apos;s privacy</h2>
        <p className="mt-3 text-zinc-700">
          The Service is intended for businesses and adults. We do not knowingly collect
          personal information from children under 16. If you believe we have collected such
          information, contact us and we will take appropriate steps to delete it.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">9. Changes to this policy</h2>
        <p className="mt-3 text-zinc-700">
          We may update this Privacy Policy from time to time. We will post the updated
          version on this page and update the &quot;Last updated&quot; date. For material changes, we
          will provide additional notice where appropriate.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">10. Contact (privacy)</h2>
        <p className="mt-3 text-zinc-700">
          For privacy-related questions or requests, contact us at the support email listed
          on our website or in your BayDesk account. Please include enough detail for us to
          help you (for example, the email address associated with your account).
        </p>
      </section>
    </LegalDocLayout>
  );
}
