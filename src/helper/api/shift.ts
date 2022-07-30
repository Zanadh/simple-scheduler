import { getAxiosInstance } from ".";

type GetShiftParamsType = 'firstDateOfWeek' | 'relations'
type GetShiftPropsInterface = {
  [key in GetShiftParamsType]: string | string[];
};

// TODO: fix interfaces
export const getShifts = async (props?: GetShiftPropsInterface) => {
  const api = getAxiosInstance()
  const { data } = await api.get("/shifts?order[date]=DESC&order[startTime]=ASC", { params: props });
  return data;
};

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.post("/shifts", payload);
  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.delete(`/shifts/${id}`);
  return data;
};

export const publishShiftByWeekId = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.put(`/weeks/${id}/publish`);
  return data;
};

