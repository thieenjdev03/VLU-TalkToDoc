export interface ISpecialtyItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  status: string;
  value: string;
  avatar: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
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
