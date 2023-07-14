import { tokenDataTypes } from "./userContext.types";

export type getHouseIdQueryData = {
  houseid?: number | null;
  wing?: "a" | "b" | null;
  houseno?: number | null;
  members?: number[];
};

export type getUserIdByEmailQueryData = {
  userid?: number;
  name?: string;
  email?: string;
  phone?: string;
  imgUrl?: string | null;
  houseids?: number[] | null;
  verified?: boolean;
};

export type getUserNamesQueryData = {
  id: number | null;
  name: string | null;
}[];

export type loginQueryData = {
  userid?: number;
  token_data?: tokenDataTypes;
};

export type LoginFormValues = {
  houseno?: number;
  email?: string;
  otp?: number;
  password?: string;
};
