import Fetcher from '../library/Fetcher';

export const TrackReview = async data => {
  return Fetcher.post('TrackReview', data);
};

export default TrackReview;
