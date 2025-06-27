import Fetcher from "../library/Fetcher";


export const getMedicalQuestions = async (data) => {
  return Fetcher.get("/GetQuestions");
};

export default { getMedicalQuestions };
