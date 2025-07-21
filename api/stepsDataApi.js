// /api/getVariationsApi.js

import Fetcher from '../library/Fetcher';

export const sendStepData = async data => {
  return Fetcher.post(`/order/consultationMayfair`, data);
};

export default sendStepData;
