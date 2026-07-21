export type PetVaccineRow = {
  id: string;
  user_id: string;
  pet_id: string;
  vaccine_key: string | null;
  custom_name: string | null;
  given_on: string | null;
  next_due_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PetVaccineInput = {
  petId: string;
  vaccineKey?: string | null;
  customName?: string | null;
  givenOn?: string | null;
  nextDueOn?: string | null;
  notes?: string | null;
};

export type VaccineDueStatus = 'overdue' | 'soon' | 'ok' | 'none';
