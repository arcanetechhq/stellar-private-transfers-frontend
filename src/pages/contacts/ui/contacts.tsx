import { useNavigate } from "react-router";
import "./contacts.css";
import { ContactList } from "@/features/view-contact-list";

export function Contacts() {
  const navigate = useNavigate();

  return (
    <div className="contacts-page bg-background">
      <section className="page-column full-table-route contacts-route">
        <ContactList onAddContact={() => navigate("/contacts/new")} />
      </section>
    </div>
  );
}
