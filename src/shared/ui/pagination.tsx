import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...properties }: React.ComponentProps<"nav">) {
  const { t: translate } = useTranslation("common");
  return (
    <nav
      role="navigation"
      aria-label={translate("a11y.pagination")}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...properties}
    />
  );
}

function PaginationContent({
  className,
  ...properties
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...properties}
    />
  );
}

function PaginationItem({ ...properties }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...properties} />;
}

type PaginationLinkProperties = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...properties
}: PaginationLinkProperties) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...properties}
    />
  );
}

function PaginationPrevious({
  className,
  ...properties
}: React.ComponentProps<typeof PaginationLink>) {
  const { t: translate } = useTranslation("common");
  return (
    <PaginationLink
      aria-label={translate("a11y.goToPreviousPage")}
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...properties}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{translate("a11y.previous")}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...properties
}: React.ComponentProps<typeof PaginationLink>) {
  const { t: translate } = useTranslation("common");
  return (
    <PaginationLink
      aria-label={translate("a11y.goToNextPage")}
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...properties}
    >
      <span className="hidden sm:block">{translate("a11y.next")}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...properties
}: React.ComponentProps<"span">) {
  const { t: translate } = useTranslation("common");
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...properties}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{translate("a11y.morePages")}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
