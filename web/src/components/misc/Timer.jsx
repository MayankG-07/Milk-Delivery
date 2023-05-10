import { useTimer } from "react-timer-hook";
import { PropTypes } from "prop-types";

export const Timer = ({ expiryTimestamp, children }) => {
  let { minutes, seconds, isRunning } = useTimer({ expiryTimestamp });
  if (isRunning) {
    if (seconds < 10) {
      seconds = `0${seconds.toString()}`;
    } else {
      seconds = seconds.toString();
    }

    if (minutes < 10) {
      minutes = `0${minutes.toString()}`;
    } else {
      minutes = minutes.toString();
    }
  }
  return <>{children(minutes, seconds, isRunning)}</>;
};

Timer.propTypes = {
  expiryTimestamp: PropTypes.instanceOf(Date),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
