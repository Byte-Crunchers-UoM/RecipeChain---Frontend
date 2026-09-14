"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const LAST_UPDATED = "2026-02-21";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            ← Back
          </button>

          <Link
            href="/"
            className="text-sm font-semibold text-teal-700 hover:underline"
          >
            RecipeChain
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {LAST_UPDATED}
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Notice:</span> This Terms of Service is
              drafted for a student/academic project style platform (Recipe marketplace,
              Web3 login, blockchain micro-payments, AI features). Review with a
              supervisor/legal advisor before production use.
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">
              RecipeChain (“we”, “our”, “us”) is a recipe marketplace where Sellers
              (Chefs) can publish and monetize original recipes and Buyers can unlock
              premium recipes using small cryptocurrency payments. RecipeChain may
              provide AI-assisted discovery and analysis features. By using RecipeChain,
              you agree to these Terms.
            </p>

            {/* TOC (NO map, NO index) */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 px-5 py-5">
              <p className="text-sm font-semibold text-gray-800">On this page</p>
              <ul className="mt-3 grid gap-2 text-sm text-teal-700 sm:grid-cols-2">
                <li>
                  <a className="hover:underline" href="#acceptance">
                    1. Acceptance
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#eligibility">
                    2. Eligibility
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#accounts">
                    3. Accounts & Roles
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#payments">
                    4. Payments & Fees
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#content">
                    5. Content & Ownership
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#prohibited">
                    6. Prohibited Use
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#ai">
                    7. AI Features
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#privacy">
                    8. Privacy
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#termination">
                    9. Termination
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#disclaimers">
                    10. Disclaimers
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#liability">
                    11. Limitation of Liability
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#contact">
                    12. Contact
                  </a>
                </li>
              </ul>
            </div>

            <Section id="acceptance" title="1. Acceptance of these Terms">
              By accessing or using RecipeChain, you agree to these Terms and our{" "}
              <Link href="/privacy" className="text-teal-700 hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the service.
            </Section>

            <Section id="eligibility" title="2. Eligibility">
              You must be at least 16 years old (or the minimum legal age in your
              jurisdiction) to use RecipeChain. If you use RecipeChain on behalf of
              an organization, you represent you have authority to bind that
              organization.
            </Section>

            <Section id="accounts" title="3. Accounts & Roles (Buyer / Seller / Admin)">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Web3 login:</span> You may sign in
                  through Web3Auth (or similar). Some logins may create/connect a
                  wallet to enable blockchain interactions.
                </li>
                <li>
                  <span className="font-semibold">Role selection:</span> Users may act
                  as Buyers or Sellers. Admins may manage moderation and platform
                  operations.
                </li>
                <li>
                  <span className="font-semibold">Seller verification:</span> Sellers
                  may be required to complete verification/KYC before listing paid
                  content (if enabled by the platform).
                </li>
                <li>
                  <span className="font-semibold">Security:</span> You are responsible
                  for activity on your account and for keeping access methods secure.
                </li>
              </ul>
            </Section>

            <Section id="payments" title="4. Payments, Fees, and Unlocking Recipes">
              <p>
                RecipeChain may allow Buyers to unlock premium recipes using small
                cryptocurrency payments (“Pay to Unlock”). Blockchain transactions may
                be recorded publicly and may be irreversible.
              </p>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  Platform commission
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  RecipeChain may charge a service commission on successful purchases
                  (example: 10–15%) to support platform operations.
                </p>
              </div>

              <p className="mt-4">
                <span className="font-semibold">Refunds:</span> If refunds are offered,
                they may be limited due to blockchain finality and are handled case-by-case.
              </p>
            </Section>

            <Section id="content" title="5. Content, Ownership, and License">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Seller ownership:</span> Sellers retain
                  ownership of original recipes and media they upload.
                </li>
                <li>
                  <span className="font-semibold">License to RecipeChain:</span> You grant
                  RecipeChain a non-exclusive license to host, display, and distribute your
                  content to operate the marketplace (including previews and listings).
                </li>
                <li>
                  <span className="font-semibold">Buyer access:</span> Unlocking a recipe grants
                  personal access for viewing/using. It does not allow redistribution or resale.
                </li>
              </ul>
            </Section>

            <Section id="prohibited" title="6. Prohibited Use">
              You agree not to:
              <ul className="mt-3 list-disc pl-5 space-y-2">
                <li>Upload content you do not have rights to.</li>
                <li>Attempt to bypass paywalls, access controls, or role-based restrictions.</li>
                <li>Use the service for fraud, money laundering, or illegal activity.</li>
                <li>Harass users or post abusive/hateful content.</li>
                <li>Exploit vulnerabilities or disrupt the platform.</li>
              </ul>
            </Section>

            <Section id="ai" title="7. AI Features (Chatbot, Analysis, Recommendations)">
              RecipeChain may provide AI features (chat-based discovery, suggestions,
              analysis, tagging). AI output may be inaccurate. Always confirm cooking
              safety and dietary needs (allergies/medical conditions).
            </Section>

            <Section id="privacy" title="8. Privacy">
              Please read our{" "}
              <Link href="/privacy" className="text-teal-700 hover:underline">
                Privacy Policy
              </Link>{" "}
              to understand how we collect and use data.
            </Section>

            <Section id="termination" title="9. Termination">
              We may suspend or terminate access for violations, suspected fraud, or
              security concerns. You may stop using RecipeChain at any time.
            </Section>

            <Section id="disclaimers" title="10. Disclaimers">
              RecipeChain is provided “as is” and “as available.” We do not guarantee
              uninterrupted service. Blockchain networks and third-party services may
              have outages or delays.
            </Section>

            <Section id="liability" title="11. Limitation of Liability">
              To the maximum extent permitted by law, RecipeChain will not be liable
              for indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits or data, arising from your use of the service.
            </Section>

            <Section id="contact" title="12. Contact">
              For questions about these Terms, contact the RecipeChain team via your
              project support channel/email.
            </Section>

            {/* Bottom actions */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.back()}
                className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                ← Back
              </button>

              <div className="text-sm text-gray-500">
                Also read:{" "}
                <Link href="/privacy" className="text-teal-700 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © 2026 RecipeChain. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}