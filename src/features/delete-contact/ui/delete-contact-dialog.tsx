import { useState, type SyntheticEvent } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store";
import { removeContact, type Contact } from "@/entities/contact";
import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import "./delete-contact-dialog.css";

type DeleteContactDialogProperties = {
  contact: Contact;
  onDeleted?: () => void;
};

export function DeleteContactDialog({
  contact,
  onDeleted,
}: DeleteContactDialogProperties) {
  const dispatch = useAppDispatch();
  const { t: translate } = useTranslation("contacts");
  const [open, setOpen] = useState(false);

  function handleDelete() {
    dispatch(removeContact(contact.id));
    onDeleted?.();
    setOpen(false);
  }

  function stopRowActivation(event: SyntheticEvent) {
    event.stopPropagation();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="contact-row-action-button contact-row-action-button--danger"
          aria-label={translate("deleteContact")}
          onClick={stopRowActivation}
          onPointerDown={stopRowActivation}
        >
          <Trash2 aria-hidden="true" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="delete-contact-dialog"
        onPointerDown={stopRowActivation}
        onClick={stopRowActivation}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{translate("deleteContactTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {translate("deleteContactDescription", { name: contact.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{translate("cancel")}</AlertDialogCancel>
          <button
            type="button"
            className={cn(buttonVariants())}
            onClick={(event) => {
              stopRowActivation(event);
              handleDelete();
            }}
          >
            {translate("deleteContact")}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
