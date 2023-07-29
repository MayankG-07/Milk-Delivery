import { useTimer } from "react-timer-hook";

type TimerProps = {
  expiryTimestamp: Date;
  children: (
    isRunning: boolean,
    minutesString?: string,
    secondsString?: string
  ) => React.ReactNode | void;
};

export const Timer = ({ expiryTimestamp, children }: TimerProps) => {
  const { minutes, seconds, isRunning } = useTimer({ expiryTimestamp });
  let minutesString = "";
  let secondsString = "";

  if (isRunning) {
    if (seconds < 10) {
      secondsString = `0${seconds.toString()}`;
    } else {
      secondsString = seconds.toString();
    }

    if (minutes < 10) {
      minutesString = `0${minutes.toString()}`;
    } else {
      minutesString = minutes.toString();
    }
  }
  return <>{children(isRunning, minutesString, secondsString)}</>;
};
