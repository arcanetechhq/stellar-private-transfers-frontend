import { AtSign, Globe2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContactAccountType } from "@/entities/contact";

const typeIcons = {
  userId: AtSign,
  publicAddress: Globe2,
  privateAddress: ShieldCheck,
} as const;

type ContactTypeBadgeProperties = {
  type: ContactAccountType;
};

export function ContactTypeBadge({ type }: ContactTypeBadgeProperties) {
  const { t: translate } = useTranslation("contacts");
  const TypeIcon = typeIcons[type];
  const labelKey = {
    userId: "accountTypeUserId",
    publicAddress: "accountTypePublicAddress",
    privateAddress: "accountTypePrivateAddress",
  } as const;

  return (
    <span className="contact-type">
      <span className="contact-type__icon" aria-hidden="true">
        <TypeIcon />
      </span>
      {translate(labelKey[type])}
    </span>
  );
}
