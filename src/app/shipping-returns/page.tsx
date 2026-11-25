import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "Shipping and returns",
  description: "Delivery options, timing, cancellations, returns and refunds at MAISON.",
};

const sections: Section[] = [
  {
    heading: "Delivery options",
    body: [
      "Standard: $6.00, 4 to 7 business days. Free on orders over $100.",
      "Express: $15.00, 2 to 3 business days.",
      "Next day: $25.00, 1 business day.",
      "Prices are set in US dollars and shown at checkout in your selected currency. Available options depend on your delivery address.",
    ],
  },
  {
    heading: "Order processing",
    body: [
      "Orders are prepared as soon as they are confirmed. You will receive the carrier name and tracking number once your order ships.",
    ],
  },
  {
    heading: "Cash on delivery",
    body: [
      "You can pay in cash when your order arrives. Please keep the exact amount ready. Cash on delivery orders that are not confirmed may be cancelled automatically after 48 hours.",
    ],
  },
  {
    heading: "Cancellations",
    body: [
      "You can cancel an order while it is pending or being processed. Contact us with your order number. Orders that have shipped cannot be cancelled, but can be returned.",
    ],
  },
  {
    heading: "Returns and exchanges",
    body: [
      "You may return unworn items in their original condition, with tags attached, within 14 days of delivery. To start a return, contact us with your order number and the items you wish to return.",
      "Footwear must be returned in its original box and not worn outdoors.",
    ],
  },
  {
    heading: "Refunds",
    body: [
      "Once we receive and inspect your return, we will confirm the refund by email. Refunds are issued to the original payment method, or arranged with you for cash on delivery orders.",
    ],
  },
  {
    heading: "Damaged or incorrect items",
    body: [
      "If your item arrives damaged or is not what you ordered, contact us as soon as possible with photos and your order number and we will make it right.",
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <StaticPage
      title="Shipping and returns"
      intro="Clear delivery options and a simple returns process."
      sections={sections}
    />
  );
}