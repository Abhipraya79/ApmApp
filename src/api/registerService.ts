import apiClient from "./apiClient";

export interface DAOUser {
  username: string;
  password: string;
}

export interface AppUserResponse {
  id?: number;
  userName?: string;
  userKey?: string;
}
export const registerUser = async (
  payload: DAOUser
): Promise<AppUserResponse> => {
  const res = await apiClient.post("/api/register", payload);
  return res.data;
};
