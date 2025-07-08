// /api/getOrderByIdApi.js
import Fetcher from "../library/Fetcher";

export const getOrderByIdApi = async (id) => {
  return Fetcher.get(`order/ViewOrder/${id}`);
};

export default getOrderByIdApi;
