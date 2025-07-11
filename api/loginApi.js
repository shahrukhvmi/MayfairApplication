import Fetcher from "../library/Fetcher";

export const Login = async (data) => {
  return Fetcher.post("/auth/login", data);
};