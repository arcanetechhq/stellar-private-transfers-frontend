import { Navigate, useNavigate, useParams } from "react-router";
import "./contacts.css";
import { useAppSelector } from "@/store";
import { selectContactById } from "@/entities/contact";
import { EditContactScreen } from "@/features/edit-contact";

function parseContactId(rawContactId: string | undefined): number | undefined {
  if (!rawContactId) {
    return undefined;
  }
  const contactId = Number(rawContactId);
  if (!Number.isInteger(contactId) || contactId <= 0) {
    return undefined;
  }
  return contactId;
}

export function EditContactPage() {
  const navigate = useNavigate();
  const { contactId: rawContactId } = useParams<{ contactId: string }>();
  const contactId = parseContactId(rawContactId);
  const contact = useAppSelector((state) =>
    contactId === undefined ? undefined : selectContactById(state, contactId),
  );

  if (contactId === undefined || !contact) {
    return <Navigate to="/contacts" replace />;
  }

  return (
    <div className="contacts-page bg-background">
      <EditContactScreen
        contact={contact}
        onSuccess={() => navigate("/contacts", { replace: true })}
      />
    </div>
  );
}
