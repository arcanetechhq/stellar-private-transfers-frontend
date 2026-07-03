export {
  addContact,
  contactReducer,
  COPY_FEEDBACK_TIMEOUT_MS,
  INITIAL_CONTACTS,
  removeContact,
  selectContactById,
  selectContacts,
  updateContact,
  type Contact,
  type ContactAccountType,
  type ContactState,
} from "./model/contact";
export { loadContactState, saveContactState } from "./lib/persist-contact";
