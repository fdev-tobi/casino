import type { Metadata } from "next";

import { ProsePage } from "@/components/layout/prose-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Placeholder" title="Privacy">
      <p>
        {brand.name} in this stage does not collect account credentials or process payments. Chat drafts and login
        fields stay in the browser and are not submitted to a backend.
      </p>
      <p>
        When authentication or analytics are added later, this page should be replaced with the client&apos;s
        approved privacy policy.
      </p>
    </ProsePage>
  );
}
