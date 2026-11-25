import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply when you browse and shop at MAISON.",
};

const sections: Section[] = [
  {
    heading: "Using our website",
    body: [
      "By accessing or shopping on this website you agree to these terms. Please use the site lawfully and do not attempt to disrupt its operation or access areas you are not authorised to use. Last updated: November 2026.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You are responsible for keeping your account details confidential and for activity under your account. Please give accurate information when you register or place an order.",
    ],
  },
  {
    heading: "Orders and acceptance",
    body: [
      "Placing an order is an offer to buy. We confirm your order by email, and may decline or cancel an order, for example because of stock availability, pricing errors or suspected fraud. If we cancel an order you have already paid for, we will refund you in full.",
    ],
  },
  {
    heading: "Prices and currency",
    body: [
      "Prices are set in US dollars and may be displayed in other currencies using the exchange rate shown at the time. The amount you pay is the total shown at checkout in your selected currency. Taxes and delivery charges, where they apply, are shown before you confirm your order.",
    ],
  },
  {
    heading: "Payment",
    body: [
      "We currently accept cash on delivery. Additional payment methods may be added over time and will be shown at checkout.",
    ],
  },
  {
    heading: "Delivery, cancellations and returns",
    body: [
      "Delivery, cancellation, return and refund terms are set out on our Shipping and returns page, which forms part of these terms.",
    ],
  },
  {
    heading: "Product information",
    body: [
      "We take care to describe and photograph our products accurately. Colours may vary slightly depending on your screen.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "All content on this website, including text, images, logos and designs, belongs to MAISON or its licensors and may not be copied or used without permission.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the extent permitted by law, MAISON is not liable for indirect or consequential losses arising from use of the website. Nothing in these terms limits your statutory consumer rights.",
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "We may update these terms from time to time. The version on this page applies to your use of the site from the date it is posted.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms? Reach us through the details on our Contact page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of service"
      intro="The terms that apply when you shop with us."
      sections={sections}
    />
  );
}