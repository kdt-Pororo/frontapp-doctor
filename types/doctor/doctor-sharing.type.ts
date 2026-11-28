export interface DoctorSharedContext {
  guardian_contacts: {
    shared: boolean;
    items: { id: number; name: string; phone: string }[];
  };
  symptoms: {
    shared: boolean;
    total: number | null;
    page: number;
    page_size: number;
    items: {
      id: number;
      recorded_at: string;
      condition: string;
      memo: string;
      symptom_types: string[];
    }[];
  };
}
