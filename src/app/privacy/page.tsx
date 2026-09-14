"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const LAST_UPDATED = "2026-02-21";

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {LAST_UPDATED}
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Notice:</span> This policy is tailored to
              RecipeChain features (Web3Auth login, blockchain payments, AI discovery).
              Review with a supervisor/legal advisor before production.
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">
              This Privacy Policy explains how RecipeChain collects, uses, and shares
              information when you use our platform.
            </p>

            {/* TOC (NO map, NO index) */}
            <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 px-5 py-5">
              <p className="text-sm font-semibold text-gray-800">On this page</p>
              <ul className="mt-3 grid gap-2 text-sm text-teal-700 sm:grid-cols-2">
                <li>
                  <a className="hover:underline" href="#data-we-collect">
                    1. Data We Collect
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#how-we-use">
                    2. How We Use Data
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#sharing">
                    3. Sharing & Disclosure
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#blockchain">
                    4. Blockchain Data
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#kyc">
                    5. Seller Verification (KYC)
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#cookies">
                    6. Cookies
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#security">
                    7. Security
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#retention">
                    8. Data Retention
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#rights">
                    9. Your Rights
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="#contact">
                    10. Contact
                  </a>
                </li>
              </ul>
            </div>

            <Section id="data-we-collect" title="1. Data We Collect">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Account & role info:</span> role selection
                  (Buyer/Seller), basic profile settings, and preferences.
                </li>
                <li>
                  <span className="font-semibold">Authentication data:</span> login metadata
                  via Web3Auth (we do not ask for passwords).
                </li>
                <li>
                  <span className="font-semibold">Wallet/transaction references:</span> public
                  wallet addresses and transaction IDs used to verify paid unlock access.
                </li>
                <li>
                  <span className="font-semibold">Marketplace usage:</span> browsing activity,
                  saved recipes, purchases/unlocks, ratings and reviews (if enabled).
                </li>
                <li>
                  <span className="font-semibold">AI interactions:</span> prompts and responses
                  used to provide chat/search features (and improve results when enabled).
                </li>
                <li>
                  <span className="font-semibold">Device/technical data:</span> logs such as IP,
                  browser type, timestamps, and security events.
                </li>
              </ul>
            </Section>

            <Section id="how-we-use" title="2. How We Use Your Data">
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide the service (login, dashboards, recipe access).</li>
                <li>Verify payments and unlock premium recipes.</li>
                <li>Improve platform security and prevent fraud.</li>
                <li>Support customer/project assistance and maintenance.</li>
                <li>Operate AI features like discovery and recipe assistance.</li>
              </ul>
            </Section>

            <Section id="sharing" title="3. Sharing & Disclosure">
              We may share limited information with:
              <ul className="mt-3 list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Service providers</span> (hosting, analytics,
                  error monitoring, security).
                </li>
                <li>
                  <span className="font-semibold">Authentication provider</span> (Web3Auth)
                  to enable login.
                </li>
                <li>
                  <span className="font-semibold">Legal/safety</span> when required by law or
                  to protect users and the platform.
                </li>
              </ul>
              <p className="mt-3 text-gray-600">We do not sell personal information.</p>
            </Section>

            <Section id="blockchain" title="4. Blockchain Data (Public & Irreversible)">
              Some payment activity may be recorded on blockchain networks. Blockchain data
              can be public and may not be erasable. RecipeChain uses transaction references
              to confirm unlock access.
            </Section>

            <Section id="kyc" title="5. Seller Verification (KYC)">
              If enabled, Sellers may be asked to provide verification details to reduce fraud
              and ensure platform trust. KYC information (if collected) is used only for
              verification, compliance, and fraud prevention.
            </Section>

            <Section id="cookies" title="6. Cookies">
              We may use cookies or similar technologies to keep you signed in, remember your
              settings, and improve reliability/security. You can disable cookies in your browser,
              but some features may not work.
            </Section>

            <Section id="security" title="7. Security">
              We use reasonable safeguards such as HTTPS, access controls, and monitoring. No system
              is completely secure—please protect your device and login methods.
            </Section>

            <Section id="retention" title="8. Data Retention">
              We keep data as long as needed to provide the service, comply with obligations, and
              secure the platform. Blockchain records may be permanent.
            </Section>

            <Section id="rights" title="9. Your Rights">
              Depending on your location, you may request access, correction, or deletion of certain
              personal data. Some records (blockchain/public ledger info, security logs) may not be
              deletable.
            </Section>

            <Section id="contact" title="10. Contact">
              For privacy questions or requests, contact the RecipeChain team via your project support
              channel/email. Also see{" "}
              <Link href="/terms" className="text-teal-700 hover:underline">
                Terms of Service
              </Link>
              .
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
                <Link href="/terms" className="text-teal-700 hover:underline">
                  Terms of Service
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