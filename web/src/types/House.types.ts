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

export type subDetails = {
  subid: number;
  milkids: number[];
  sub_start: Date;
  sub_end: Date;
  days: Day[];
  pause_dates: Date[];
  resume_dates: Date[];
  delivered: Date[];
  not_delivered: Date[];
  active: boolean;
  houseid: number;
};

export type fetchHouseSubsDetailsData = {
  subs: subDetails[];
};
