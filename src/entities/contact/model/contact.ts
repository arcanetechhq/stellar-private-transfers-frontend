import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Contact {
  id: number;
  name: string;
  stellarAddress: string;
}

export type ContactAccountType = "userId" | "publicAddress" | "privateAddress";

export const COPY_FEEDBACK_TIMEOUT_MS = 2000;

export const INITIAL_CONTACTS: Contact[] = [];

export interface ContactState {
  items: Contact[];
}

const initialState: ContactState = {
  items: INITIAL_CONTACTS,
};

function nextContactId(items: Contact[]) {
  let maxId = 0;
  for (const contact of items) {
    if (contact.id > maxId) {
      maxId = contact.id;
    }
  }
  return maxId + 1;
}

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    addContact: (
      state,
      action: PayloadAction<{ name: string; stellarAddress: string }>,
    ) => {
      const id = nextContactId(state.items);
      state.items.push({
        id,
        name: action.payload.name,
        stellarAddress: action.payload.stellarAddress,
      });
    },
    updateContact: (
      state,
      action: PayloadAction<{
        id: number;
        name: string;
        stellarAddress: string;
      }>,
    ) => {
      const contact = state.items.find((item) => item.id === action.payload.id);
      if (!contact) {
        return;
      }
      contact.name = action.payload.name;
      contact.stellarAddress = action.payload.stellarAddress;
    },
    removeContact: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addContact, updateContact, removeContact } = contactSlice.actions;
export const contactReducer = contactSlice.reducer;

export const selectContacts = (state: { contact: ContactState }) =>
  state.contact.items;

export const selectContactById = createSelector(
  [
    selectContacts,
    (_state: { contact: ContactState }, contactId: number) => contactId,
  ],
  (contacts, contactId) => contacts.find((contact) => contact.id === contactId),
);
