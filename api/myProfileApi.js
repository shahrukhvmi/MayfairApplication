import Fetcher from '../library/Fetcher';

export const sendProfileData = async data => {
  return Fetcher.post('/profile/UpdateUserData', data);
};

export const getProfileData = async data => {
  return Fetcher.get('/profile/GetUserData', data);
};

export default {sendProfileData, getProfileData};
