export interface DisclosureOption {
  id: string;
  titleKey: string;
  descriptionKey: string;
}

export interface ActivityLogEntry {
  date: string;
  action: string;
  status: string;
}

export const DISCLOSURE_OPTIONS: DisclosureOption[] = [
  {
    id: "fact",
    titleKey: "disclosureOptions.fact.title",
    descriptionKey: "disclosureOptions.fact.description",
  },
  {
    id: "amount",
    titleKey: "disclosureOptions.amount.title",
    descriptionKey: "disclosureOptions.amount.description",
  },
  {
    id: "parties",
    titleKey: "disclosureOptions.parties.title",
    descriptionKey: "disclosureOptions.parties.description",
  },
  {
    id: "full",
    titleKey: "disclosureOptions.full.title",
    descriptionKey: "disclosureOptions.full.description",
  },
];

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    date: "2026-03-10T10:35:00",
    action: "Transaction confirmation created",
    status: "completed",
  },
  {
    date: "2026-03-10T10:30:00",
    action: "Transaction completed",
    status: "completed",
  },
  {
    date: "2026-03-10T10:28:00",
    action: "Transaction created",
    status: "completed",
  },
];
