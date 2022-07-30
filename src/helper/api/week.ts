import { getAxiosInstance } from ".";

type GetShiftParamsType = 'firstDateOfWeek'
type GetShiftPropsInterface = {
  [key in GetShiftParamsType]: string;
};

// TODO: fix interfaces
export const getWeek = async (props?: GetShiftPropsInterface) => {
  const api = getAxiosInstance()
  const params = new URLSearchParams('');
  if (props) {
    Object.keys(props).forEach((key) => {
      params.append(key, props[key as GetShiftParamsType])
    })
  }
  const { data } = await api.get(`/weeks?${params}`);
  return data;
};
