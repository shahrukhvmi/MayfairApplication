import Fetcher from "../library/Fetcher";

export const userConsultationApi = async (data) => {
  return Fetcher.post("/GetStepsData", data);
};

export default { userConsultationApi };
