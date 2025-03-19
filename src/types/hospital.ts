export interface IPharmacyItem {
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
export interface IPharmacyTableFilters {
  name: string;
  status: string;
  pharmacy: IPharmacyItem[];
}
export interface IPharmacyTableFilterValue {
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
