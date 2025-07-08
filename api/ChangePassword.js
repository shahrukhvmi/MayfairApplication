// src/api/forgotPasswordApi.js
import Fetcher from "../library/Fetcher";

export const ChangePassword = async ({ old_password, newpassword, newpassword_confirmation }) => {
    return Fetcher.post("/password/ChangePassword", {  old_password, newpassword, newpassword_confirmation });
};
