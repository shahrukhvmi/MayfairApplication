// /api/getOrders.js

import Fetcher from '../library/Fetcher';

export const GetOrdersApi = async ({data, page}) => {
  return Fetcher.get(`order/myorders`, {
    params: {
      ...data,
      page,
    },
  });
};

export default GetOrdersApi;
