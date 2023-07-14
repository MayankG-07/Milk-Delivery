export type RegisterHouseFormValues = {
  houseno: number;
};

export type getHouseIdQueryData = {
  houseid?: number | null;
  wing?: "a" | "b" | null;
  houseno?: number | null;
  members?: number[];
};

export type registerHouseQueryData = {
  houseid?: number;
  wing?: "a" | "b";
  houseno?: number;
  members?: number[];
};
