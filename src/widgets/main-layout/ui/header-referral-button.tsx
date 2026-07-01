import { Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCopy } from "@/shared/hooks/use-copy";

export function HeaderReferralButton() {
  const { t: translate } = useTranslation(["common", "settings"]);
  const referralLink = translate("settings:referral.inviteLink.linkValue");
  const { handleCopy } = useCopy(referralLink);

  return (
    <button
      type="button"
      className="topbar-action"
      onClick={() => {
        void handleCopy();
      }}
    >
      <Gift size={18} strokeWidth={1.5} />
      <span>{translate("common:referralCta")}</span>
    </button>
  );
}
