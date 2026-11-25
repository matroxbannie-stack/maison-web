import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with MAISON customer care.",
};

const sections: Section[] = [
  {
    heading: "Customer care",
    body: [
      "Email: support@maison.example",
      "Phone: +92 300 0000000",
      "Hours: Monday to Saturday, 10:00 to 18:00 (PKT)",
    ],
  },
  {
    heading: "Order questions",
    body: [
      "Please include your order number (for example MS-20261125-ABCDE) so we can help you faster. You will find it in your order confirmation.",
    ],
  },
  {
    heading: "Response time",
    body: [
      "We reply to every message, usually within one business day.",
    ],
  },
  {
    heading: "Before you write",
    body: [
      "Many answers are already on our FAQ and Shipping and returns pages: delivery times, sizing, cancellations and returns.",
    ],
  },
];

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact us"
      intro="We are here to help with orders, sizing and anything else."
      sections={sections}
    />
  );
}