import Fetcher from "../library/Fetcher";

export const RemoveAbandonCartApi = async (notification_id) => {
  return Fetcher.post("/DeleteAbandonedCart", notification_id);
};

export default RemoveAbandonCartApi;
