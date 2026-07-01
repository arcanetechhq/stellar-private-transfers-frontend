import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { MainLayoutPageHeaderConfig } from "../lib/resolve-main-layout-page-header";
import { cn } from "@/shared/lib/cn";

interface MainLayoutPageTitleProperties {
  pageHeader: MainLayoutPageHeaderConfig;
}

export function MainLayoutPageTitle({
  pageHeader,
}: MainLayoutPageTitleProperties) {
  const navigate = useNavigate();
  const { t: translate } = useTranslation([
    pageHeader.titleNamespace,
    "navigation",
    "common",
  ]);

  const title = translate(`${pageHeader.titleNamespace}:${pageHeader.titleKey}`);

  const iCanBackTo = pageHeader.showBack && pageHeader.backTo;

  return (
    <div className={cn("page-header__title", iCanBackTo && "cursor-pointer")} onClick={iCanBackTo ? () => navigate(pageHeader.backTo ?? "/") : undefined}>
      {iCanBackTo ? (
        <ChevronLeft size={20} strokeWidth={1.5} />
      ) : null}
      <h1 className="ui-heading" data-size="md">
        {title}
      </h1>
    </div>
  );
}
