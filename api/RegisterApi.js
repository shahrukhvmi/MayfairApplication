import Fetcher from "../library/Fetcher";

const RegisterApi = async (data) => {
  return Fetcher.post("/auth/registerPatient", data);
};

export default RegisterApi;
