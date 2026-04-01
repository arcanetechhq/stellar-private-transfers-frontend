export {
  addContact,
  contactReducer,
  COPY_FEEDBACK_TIMEOUT_MS,
  INITIAL_CONTACTS,
  selectContacts,
  type Contact,
  type ContactState,
} from "./model/contact";
export { loadContactState, saveContactState } from "./lib/persist-contact";
