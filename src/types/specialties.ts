export interface ISpecialtyItem {
  _id: string;
  name: string;
  description: string;
  status: string;
  value: string;
  label: string;
  active: boolean;
  createdAt: string;
}

export interface ISpecialtyTableFilters {
  name: string;
  status: string;
  specialty: string[];
}
export interface ISpecialtyTableFilterValue {
  name: string;
  status: string;
}
