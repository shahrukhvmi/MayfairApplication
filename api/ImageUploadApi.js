import Fetcher from '../library/Fetcher';

export const ImageUplaodApi = async data => {
  return Fetcher.post('/BMIImagesForOrderProcess', data, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
};

export default {ImageUplaodApi};
