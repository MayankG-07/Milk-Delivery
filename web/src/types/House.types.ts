import { Day } from "./DaysActive.types";

export type HouseProps = {
  houseid: number;
};

export type fetchHouseDetailsData = {
  houseid: number;
  wing: "a" | "b";
  houseno: number;
  members: number[];
};

export type HouseDetails = {
  houseid: number;
  wing: "a" | "b";
  houseno: number;
  members: number[];
};

export type SubDetails = {
  subid: number;
  milkids: number[];
  sub_start: Date;
  sub_end: Date;
  days: Day[];
  pause_date: Date;
  resume_date: Date;
  delivered: Date[];
  not_delivered: Date[];
  active: boolean;
  houseid: number;
};
