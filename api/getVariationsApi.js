// /api/getVariationsApi.js
import Fetcher from "../library/Fetcher";

export const getVariationsApi = async ({ data, id }) => {
  return Fetcher.get(`/products/GetVaritions/${id}`, data);
};

export default getVariationsApi;
