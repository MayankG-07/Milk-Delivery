export type TimerProps = {
  expiryTimestamp: Date;
  children: (
    isRunning: boolean,
    minutesString?: string,
    secondsString?: string
  ) => React.ReactNode | void;
};
