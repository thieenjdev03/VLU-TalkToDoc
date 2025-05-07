import { endpoints, axiosInstanceV2 } from 'src/utils/axios';

export const getAllAppointment = async () => {
  const response = await axiosInstanceV2.get(endpoints.appointment.list);
  return response.data;
};

export const doctorConfirmAppointment = async (data: any) => {
  if (data?.accepted) {
    const response = await axiosInstanceV2.patch(endpoints.appointment.doctorConfirm(data.id));
    return response.data;
  }
  const response = await axiosInstanceV2.patch(endpoints.appointment.doctorReject(data.id));
  return response.data;
};

export const deleteAppointment = async (id: string) => {
  const response = await axiosInstanceV2.delete(endpoints.appointment.delete(id));
  return response.data;
};
