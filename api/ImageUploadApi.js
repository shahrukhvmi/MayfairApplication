import Fetcher from '../library/Fetcher';

export const ImageUplaodApi = async data => {
  return Fetcher.post('BMIImagesForOrderProcess', data);
};

export default {ImageUplaodApi};
