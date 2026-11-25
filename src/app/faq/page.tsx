import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about sizing, delivery, payment, cancellations and returns at MAISON.",
};

const sections: Section[] = [
  {
    heading: "How do I find my size?",
    body: [
      "Every product page has a size guide with measurements. Customer reviews also include fit feedback (runs small, true to size or runs large). If you are between sizes, we recommend choosing the larger size.",
    ],
  },
  {
    heading: "How much is delivery and how long does it take?",
    body: [
      "Standard delivery takes 4 to 7 business days and is free on orders over $100. Express takes 2 to 3 days and next day takes 1 day. Exact prices are shown at checkout in your selected currency.",
    ],
  },
  {
    heading: "Which payment methods do you accept?",
    body: [
      "Cash on delivery is available now. Online payment options for Pakistan are coming soon.",
    ],
  },
  {
    heading: "Can I use a promo code?",
    body: [
      "Yes. Enter your code in your bag before checkout. Some codes have a minimum spend or do not apply to sale items; the conditions are shown when you apply the code.",
    ],
  },
  {
    heading: "How can I follow my order?",
    body: [
      "When your order ships you will receive the carrier name and tracking number. If you need an update, contact us with your order number.",
    ],
  },
  {
    heading: "Can I cancel my order?",
    body: [
      "You can cancel an order while it is still pending or being processed. Once it has shipped it can no longer be cancelled, but you can return it under our returns policy.",
    ],
  },
  {
    heading: "How do returns work?",
    body: [
      "Please see our Shipping and returns page for the full policy, including how to start a return and when refunds are issued.",
    ],
  },
  {
    heading: "How do I care for my items?",
    body: [
      "Fabric composition and care instructions are listed on each product page. Following them keeps your pieces looking their best for longer.",
    ],
  },
];

export default function FaqPage() {
  return (
    <StaticPage
      title="Frequently asked questions"
      intro="Quick answers about sizing, delivery, payment and returns."
      sections={sections}
    />
  );
}