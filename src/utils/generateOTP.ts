import { randomInt } from "crypto";

const generateOTP = () => {
  return randomInt(100000, 1000000);
};

export default generateOTP;
