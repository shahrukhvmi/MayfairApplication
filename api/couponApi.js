import Fetcher from '../library/Fetcher';

export const CouponApi = async data => {
  return Fetcher.post('getCoupon', data);
};
