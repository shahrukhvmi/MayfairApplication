import Fetcher from "../library/Fetcher";

export const getNotified = async (data) => {
  return Fetcher.post("/GetNotified", data);
};
