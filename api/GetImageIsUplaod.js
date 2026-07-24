// /api/getVariationsApi.js
import Fetcher from '../library/Fetcher';

export const GetImageIsUplaod = async ({data}) => {
  return Fetcher.get(`getBMIImagesForOrderProcess`, data);
};

export default GetImageIsUplaod;
