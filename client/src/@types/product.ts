export type Product = {
  id: number;
  sku: string;
  name: string;
  remark: string;
  imageName: string;
  createdAt: Date;
  updatedAt: Date;
  siteId: number;
};

export interface EditProduct {
  sku: string;
  name: string;
  remark: string;
  image: File | null;
}

export type FilterProduct = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type ProductPagedList = {
  list: Product[];
  count: number;
};
