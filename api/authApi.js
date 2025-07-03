import Fetcher from "../library/Fetcher";

export const registerUser = async (data) => {
  return Fetcher.post("auth/registerPatient", data);
};

export default { registerUser };
