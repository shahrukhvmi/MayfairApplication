// /api/getVariationsApi.js
import Fetcher from '../library/Fetcher';

export const GetProductsApi = async ({data}) => {
  return Fetcher.get(`/products/GetProducts`, data);
};

export default GetProductsApi;
