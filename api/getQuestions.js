import Fetcher from '../library/Fetcher';

export const getMedicalQuestions = async data => {
  return Fetcher.post('/GetQuestions', data);
};

export default {getMedicalQuestions};
