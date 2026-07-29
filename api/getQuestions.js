import Fetcher from '../library/Fetcher';

export const postMedicalQuestions = async data => {
  return Fetcher.post('/GetQuestions', data);
};

export default {postMedicalQuestions};
