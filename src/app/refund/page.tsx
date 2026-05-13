import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/LegalDocLayout";

export const metadata: Metadata = {
  title: "Refunds & Cancellation | BayDesk",
  description: "BayDesk refund, trial, and cancellation policy.",
};

export default function RefundPage() {
  return (
    <LegalDocLayout title="Refund &amp; Cancellation Policy">
      <section>
        <p className="text-zinc-600">
          This policy explains how free trials, paid subscriptions, refunds, and cancellations
          work for BayDesk. It is designed to be clear and fair. If anything here conflicts
          with terms shown at checkout (for example, by Paddle), the checkout terms control
          for that purchase where applicable law allows.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">1. Free trial</h2>
        <p className="mt-3 text-zinc-700">
          BayDesk may offer a <strong>14-day free trial</strong> for new subscribers, as
          described on our pricing page or at signup. During the trial you are not charged
          the recurring subscription fee (unless we clearly disclose otherwise at checkout,
          such as a card-required trial).
        </p>
        <p className="mt-3 text-zinc-700">
          If you do not want to continue after the trial, cancel before the trial ends using
          the cancellation steps below. No refund is needed for the trial period itself
          because no subscription charge applies during the free trial.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">2. Paid subscriptions and refunds</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-zinc-700">
          <li>
            <strong>First charge — 7-day satisfaction window.</strong> If you are charged
            for a paid subscription and you request a refund within{" "}
            <strong>seven (7) calendar days</strong> of that first successful charge, we will
            issue a <strong>full refund</strong> of that first subscription payment, subject
            to verification and processor timelines below.
          </li>
          <li>
            <strong>After 7 days.</strong> Subscription fees are generally{" "}
            <strong>non-refundable</strong> after the 7-day window. You may still{" "}
            <strong>cancel anytime</strong>; cancellation stops future renewals and you
            will not be charged again after the end of the billing period in which you
            cancel (subject to your payment provider&apos;s cut-off times).
          </li>
          <li>
            <strong>Pricing range.</strong> Paid plans are typically in the range of
            approximately forty to fifty US dollars ($40–$50) per month; the exact amount
            is shown at checkout and on your receipt.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">3. How to cancel</h2>
        <p className="mt-3 text-zinc-700">
          To cancel your paid subscription, go to your{" "}
          <strong>account or billing settings</strong> in BayDesk (or the customer portal
          link provided by Paddle or your payment processor) and select{" "}
          <strong>Cancel subscription</strong>. If you do not see a cancel option, contact
          support using the email below and we will help you complete cancellation.
        </p>
        <p className="mt-3 text-zinc-700">
          Canceling does not automatically delete your shop data; you may request data
          deletion separately under our Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">4. Refund processing time</h2>
        <p className="mt-3 text-zinc-700">
          Approved refunds are submitted to your payment processor (for example, Paddle).
          Once processed on our side, it typically takes{" "}
          <strong>5–10 business days</strong> for the refund to appear on your original
          payment method, depending on your bank or card issuer.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">5. What we do not refund</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-700">
          <li>
            <strong>Partial months or unused time</strong> after the 7-day first-charge
            window, except where required by law.
          </li>
          <li>
            <strong>Overdue or failed payments</strong> or amounts owed from prior periods.
          </li>
          <li>
            <strong>Abuse or violations</strong> — if an account is terminated for breach of
            our Terms of Service or fraud, we may deny refunds for the associated period.
          </li>
          <li>
            <strong>Third-party fees</strong> charged by your bank or card issuer (for
            example, currency conversion fees).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">6. How to request a refund</h2>
        <p className="mt-3 text-zinc-700">
          Email <strong>support</strong> at the contact address shown on our website or in
          your BayDesk account. Include your account email, the date of charge, and whether
          you are within 7 days of your first paid charge. We will confirm eligibility and
          coordinate with Paddle or the relevant processor.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1B2A4A]">7. Contact</h2>
        <p className="mt-3 text-zinc-700">
          For billing or refund questions, use the same support contact. We aim to respond
          within a few business days.
        </p>
      </section>
    </LegalDocLayout>
  );
}
