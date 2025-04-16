export interface IAppointmentItem {
  _id: string;
  appointmentId: string;
  patient: IPatientItem;
}

export interface IPatientItem {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}
