export type VetLogEntryType = 'meds' | 'visit' | 'note';

export type PetVetLogRow = {
  id: string;
  user_id: string;
  pet_id: string;
  entry_type: VetLogEntryType;
  title: string;
  logged_on: string;
  notes: string | null;
  next_due_on: string | null;
  created_at: string;
  updated_at: string;
};

export type PetVetLogInput = {
  petId: string;
  entryType: VetLogEntryType;
  title: string;
  loggedOn?: string | null;
  notes?: string | null;
  nextDueOn?: string | null;
};
