import type { Metadata } from "next";
import { StaticPage, type Section } from "@/components/layout/static-page";

export const metadata: Metadata = {
  title: "About MAISON",
  description: "The story, values and craft behind MAISON clothing and footwear.",
};

const sections: Section[] = [
  {
    heading: "Our story",
    body: [
      "MAISON was created around one idea: clothing and footwear should be simple, well made and made to last. We design considered essentials in clean silhouettes and honest materials, pieces that work together and stay relevant season after season.",
    ],
  },
  {
    heading: "Design approach",
    body: [
      "We make fewer, better things. Each style is developed around fit, proportion and function first, and only then refined with detail. If a feature does not make a piece better to wear, it does not make it into the collection.",
    ],
  },
  {
    heading: "Craft and materials",
    body: [
      "Every piece starts with the fabric. We choose natural and durable materials and we are open about what each product is made of and how to care for it. Composition and care instructions are listed on every product page.",
    ],
  },
  {
    heading: "Fit and sizing",
    body: [
      "Clear sizing matters. Each product includes a size guide, and customer reviews include fit feedback so you can choose with confidence.",
    ],
  },
  {
    heading: "Our promise",
    body: [
      "Fair prices, tracked delivery and a team that answers your questions. If something is not right, we will help you put it right.",
    ],
  },
];

export default function AboutPage() {
  return (
    <StaticPage
      title="About MAISON"
      intro="Timeless clothing and footwear for every day."
      sections={sections}
    />
  );
}