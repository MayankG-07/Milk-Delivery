import { Day } from "./DaysActive.types";

export type SubDetails = {
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
