import Fetcher from '../library/Fetcher';

export const GetBmiJourney = async user_id => {
  return Fetcher.get(`/patient-bmi-journey/${user_id}`);
};

export default GetBmiJourney;
