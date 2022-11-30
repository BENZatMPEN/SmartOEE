export type Product = {
  id: number;
  sku: string;
  name: string;
  remark: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  siteId: number;
};

export type FilterProduct = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};
