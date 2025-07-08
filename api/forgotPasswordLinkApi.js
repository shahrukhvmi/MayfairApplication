// src/api/forgotPasswordApi.js
import Fetcher from '../library/Fetcher';

export const forgotPasswordLink = async ({email, passwordlink, clinic_id}) => {
  return Fetcher.post('/password/ForgotPasswordLink', {
    email,
    passwordlink,
    clinic_id,
  }); // Update endpoint as needed
};
