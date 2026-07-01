import { Search } from "lucide-react";

type ContactsSearchFieldProperties = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function ContactsSearchField({
  placeholder,
  value,
  onChange,
}: ContactsSearchFieldProperties) {
  return (
    <label className="search-input">
      <Search aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
