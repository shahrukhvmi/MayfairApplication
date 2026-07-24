import Fetcher from '../library/Fetcher';

export const IdVerificationUpload = async data => {
  return Fetcher.post('UserIDVerfication', data);
};

export const GetIdVerification = async () => {
  return Fetcher.get(`getUserIDVerfication`);
};

export default {IdVerificationUpload, GetIdVerification};
