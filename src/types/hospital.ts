export interface IHospitalItem {
  _id: string;
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
  availableMedicines: string[];
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  city: string;
  value: string;
  label: string;
  isActive: boolean;
  is24Hours: boolean;
  isVerified: boolean;
  isPublic: boolean;
}
export interface IHospitalTableFilters {
  name: string;
  status: string;
  hospital: IHospitalItem[];
}
export interface IHospitalTableFilterValue {
  name: string;
  status: string;
}

export interface IProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}
