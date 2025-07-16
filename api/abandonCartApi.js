import Fetcher from "../library/Fetcher";

export const abandonCart = async (data) => {
  return Fetcher.post("/AbandonedCart", data);
};

export default { abandonCart };
