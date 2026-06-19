import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Contact {
  id: number;
  name: string;
  stellarAddress: string;
}

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
  },
});

export const { addContact } = contactSlice.actions;
export const contactReducer = contactSlice.reducer;

export const selectContacts = (state: { contact: ContactState }) =>
  state.contact.items;
