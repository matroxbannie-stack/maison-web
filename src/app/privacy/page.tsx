import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How MAISON collects, uses and protects your personal information.",
};

const sections: Section[] = [
  {
    heading: "Overview",
    body: [
      "This policy explains what personal information MAISON collects, why we collect it and how we protect it. By using our website you agree to the practices described here. Last updated: November 2026.",
    ],
  },
  {
    heading: "Information we collect",
    body: [
      "Account details: your name, email address, phone number and password (stored securely, never in plain text).",
      "Order details: delivery and billing address, items ordered, delivery method and payment method.",
      "Usage information: basic technical data such as browser type and pages visited, used to keep the site secure and working well.",
    ],
  },
  {
    heading: "How we use your information",
    body: [
      "To process and deliver your orders, send order updates, provide customer support, prevent fraud and improve our website and products. If you subscribe to our newsletter, we use your email address to send it, and you can unsubscribe at any time.",
    ],
  },
  {
    heading: "Payments",
    body: [
      "We do not store card numbers. If you pay online, payment details are handled by the payment provider. Cash on delivery orders do not require payment details online.",
    ],
  },
  {
    heading: "Cookies and local storage",
    body: [
      "We store a small identifier for your shopping bag and your light or dark theme choice in your browser so the site works as expected. We use secure, restricted cookies for sign-in sessions.",
    ],
  },
  {
    heading: "Sharing your information",
    body: [
      "We share only what is necessary with delivery carriers and payment providers to fulfil your order. We do not sell your personal information.",
    ],
  },
  {
    heading: "Data retention",
    body: [
      "We keep your information for as long as needed to provide our services, meet legal and accounting requirements and resolve disputes.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask to access, correct or delete your personal information, or to stop receiving marketing emails. Contact us using the details on our Contact page.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We use industry-standard measures to protect your information, including encrypted connections and hashed passwords. No online service can be completely risk free, but we work hard to keep your data safe.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "We may update this policy from time to time. The latest version is always available on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy policy"
      intro="How we handle your personal information."
      sections={sections}
    />
  );
}