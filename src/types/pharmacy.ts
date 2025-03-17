export interface IPharmacyItem {
  _id: string;
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
  availableMedicines: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  value: string;
  label: string;
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
