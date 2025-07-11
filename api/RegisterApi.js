import Fetcher from "../library/Fetcher";

export const RegisterApi = async (data) => {
  return Fetcher.post("/auth/registerPatient", data);
};

export default { RegisterApi };
