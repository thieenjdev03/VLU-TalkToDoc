export interface IMedicineItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  status: string;
  value: string;
  label: string;
  salary: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  base_price: number;
  quantity: number;
  price: number;
}

export interface IMedicineTableFilters {
  name: string;
  status: string;
  ranking: string[];
}
export interface IMedicineTableFilterValue {
  name: string;
  status: string;
}

export interface IMedicineTableSort {
  name: boolean;
  status: boolean;
  value: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface IMedicineTablePagination {
  page: number;
  limit: number;
  total: number;
}

export interface IMedicineTableData {
  items: IMedicineItem[];
  filters: IMedicineTableFilters;
  sort: IMedicineTableSort;
  pagination: IMedicineTablePagination;
}
