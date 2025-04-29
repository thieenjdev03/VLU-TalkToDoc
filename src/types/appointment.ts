export interface IAppointmentItem {
  _id: string;
  appointmentId: string;
  patient: IPatientItem;
  doctor: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPatientItem {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}
export interface IAppointmentTableFilters {
  patient: string;
  status: any;
  startDate: any;
  endDate: any;
  name: string;
}
export interface IAppointmentTableFilterValue {
  patient: string;
  status: string;
  payment: string;
  startDate: string | null;
  endDate: string | null;
}
