import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/LegalDocLayout";

export const metadata: Metadata = {
  title: "Terms of Service | BayDesk",
  description: "BayDesk Terms of Service for shop management software subscriptions.",
};

export default function TermsPage() {
  return (
    <LegalDocLayout title="Terms of Service">
      <section>
        <p className="text-zinc-600">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of
          BayDesk, a subscription-based software service operated by us
          (&quot;BayDesk,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) for
          independent auto repair shops and related businesses. By creating an account or
          using BayDesk, you agree to these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">1. The service</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            BayDesk provides cloud-based shop management software, including features such
            as job tracking, customer and vehicle records, invoicing, and related tools
            (the &quot;Service&quot;).
          </li>
          <li>
            The Service is offered on a subscription basis. We may offer a free trial,
            paid plans, and updates to features over time as described on our website or
            in your account.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">2. Subscriptions and billing</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            <strong>Free trial.</strong> We may offer a 14-day free trial. Trial terms are
            shown at signup or checkout. Unless you cancel before the trial ends, your
            subscription may convert to a paid plan as disclosed at purchase.
          </li>
          <li>
            <strong>Paid plans.</strong> After any trial, the Service is billed as a
            recurring subscription, currently in the range of approximately forty to fifty
            US dollars ($40–$50) per month unless a different price is shown at checkout or
            in your account. Taxes and fees may apply based on your location and payment
            method.
          </li>
          <li>
            <strong>Renewals.</strong> Subscriptions renew automatically until cancelled
            in accordance with our Refund &amp; Cancellation Policy.
          </li>
          <li>
            <strong>Payment processor.</strong> Payments may be processed by Paddle or
            other authorized payment partners. Their terms may also apply to the payment
            portion of your purchase.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">3. Your account and responsibilities</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            You must provide accurate account information and keep your login credentials
            secure. You are responsible for activity under your account.
          </li>
          <li>
            You agree not to use the Service for any unlawful purpose, to violate others&apos;
            rights, or to attempt to gain unauthorized access to the Service, our systems,
            or third-party systems.
          </li>
          <li>
            You agree not to scrape, harvest, or extract data from the Service in bulk
            except through features we expressly provide or APIs we authorize.
          </li>
          <li>
            You must respect intellectual property rights in the Service and in content
            you upload. You retain rights to your own business data; you grant us the
            rights reasonably needed to host, process, and display that data to provide
            the Service, as further described in our Privacy Policy.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">4. Disclaimer and limitation of liability</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            <strong>As-is.</strong> The Service is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. To the fullest extent permitted by law, we disclaim all
            warranties, whether express, implied, or statutory, including implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement.
          </li>
          <li>
            We do not guarantee that the Service will be uninterrupted, error-free, or free
            of harmful components. You are responsible for maintaining backups of data
            important to your business where appropriate.
          </li>
          <li>
            <strong>Limitation.</strong> To the fullest extent permitted by law, we will
            not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or for loss of profits, revenue, data, or goodwill, or for
            business interruption, arising out of or related to your use of the Service,
            even if we have been advised of the possibility of such damages.
          </li>
          <li>
            Our aggregate liability for claims arising out of or related to the Service
            will not exceed the greater of (a) the amounts you paid to us for the Service
            in the twelve (12) months before the claim or (b) fifty US dollars (USD $50),
            except where applicable law does not permit such a cap.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">5. Termination</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            <strong>Your cancellation.</strong> You may cancel your subscription at any
            time through your billing provider or account settings, as described in our
            Refund &amp; Cancellation Policy. Cancellation stops future renewals; access may
            continue until the end of the current billing period where applicable.
          </li>
          <li>
            <strong>Our suspension or termination.</strong> We may suspend or terminate your
            access if you materially breach these Terms, if we reasonably believe your use
            risks harm to the Service or others, for non-payment where applicable, or if
            we are required to do so by law. Where reasonable, we will try to give notice
            before termination for non-abuse cases.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">6. Changes to the Service and these Terms</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            We may modify features, pricing, or the Service over time. For material price
            increases or material adverse changes to these Terms, we will provide reasonable
            advance notice (for example by email or in-app notice) where required by law.
          </li>
          <li>
            Continued use of the Service after changes become effective constitutes your
            acceptance of the updated Terms, except where applicable law requires a
            different process.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">7. Governing law</h2>
        <p className="mt-3 text-zinc-700">
          These Terms are governed by the laws of the Federal Republic of Nigeria, without
          regard to conflict-of-law principles. You agree that the courts located in Nigeria
          will have exclusive jurisdiction over disputes arising out of or relating to these
          Terms or the Service, subject to any non-waivable rights you may have under
          applicable consumer protection laws in your country of residence.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">8. Contact</h2>
        <p className="mt-3 text-zinc-700">
          Questions about these Terms? Contact us at the support email shown in your BayDesk
          account or on our website.
        </p>
      </section>
    </LegalDocLayout>
  );
}
