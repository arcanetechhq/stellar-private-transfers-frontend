import React from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { cn } from "@/shared/lib/cn";

export type FormErrorAlertProperties = {
  message?: string | undefined;
  title?: string;
  className?: string;
};

export function FormErrorAlert({
  message,
  title,
  className,
}: FormErrorAlertProperties) {
  const trimmed = message?.trim();
  if (!trimmed) {
    return;
  }

  return (
    <Alert variant="destructive" className={cn(className)}>
      <CircleAlert />
      {Boolean(title) && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{trimmed}</AlertDescription>
    </Alert>
  );
}
