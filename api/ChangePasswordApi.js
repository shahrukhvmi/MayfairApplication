// src/api/forgotPasswordApi.js
import Fetcher from "../library/Fetcher";

export const forgotPassword = async ({ email, password, password_confirmation, token, company_id }) => {
    return Fetcher.post("/password/ForgotPassword", { email, password, password_confirmation, token, company_id });
};
