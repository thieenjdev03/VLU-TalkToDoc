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
  active: string;
  is24Hours: boolean;
  isVerified: boolean;
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
