// /api/getVariationsApi.js
import Fetcher from '../library/Fetcher';

export const GetProductsApi = async ({data}) => {
  return Fetcher.get(`/products/GetAllProducts`, data);
};

export default GetProductsApi;
