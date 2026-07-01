import { useNavigate } from "react-router";
import "./contacts.css";
import { AddContactScreen } from "@/features/add-contact";

export function AddContactPage() {
  const navigate = useNavigate();

  return (
    <div className="contacts-page bg-background">
      <AddContactScreen onSuccess={() => navigate("/contacts", { replace: true })} />
    </div>
  );
}
