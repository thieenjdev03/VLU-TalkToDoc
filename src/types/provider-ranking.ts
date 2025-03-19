export interface IRankingItem {
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
}

export interface IRankingTableFilters {
  name: string;
  status: string;
  ranking: string[];
}
export interface IRankingTableFilterValue {
  name: string;
  status: string;
}

export interface IRankingTableSort {
  name: boolean;
  status: boolean;
  value: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface IRankingTablePagination {
  page: number;
  limit: number;
  total: number;
}

export interface IRankingTableData {
  items: IRankingItem[];
  filters: IRankingTableFilters;
  sort: IRankingTableSort;
  pagination: IRankingTablePagination;
}
