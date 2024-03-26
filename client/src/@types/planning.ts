import { Oee } from './oee';
import { Product } from './product';
import { User } from './user';

export interface Planning {
  id: number;
  title: string;
  lotNumber: string;
  color: string;
  startDate: Date;
  endDate: Date;
  plannedQuantity: number;
  remark: string;
  productId: number;
  allDay: boolean;
  product: Product;
  oeeId: number;
  oee: Oee;
  siteId: number;
  userId: number;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  startType: string;
  endType: string;
  operatorId: number;
}

export interface EditPlanning {
  title: string;
  lotNumber: string;
  color: string;
  startDate: Date;
  endDate: Date;
  plannedQuantity: number;
  remark: string;
  productId: number;
  oeeId: number;
  userId: number;
  startType: string;
  endType: string;
  operatorId: number;
}

export interface ImportPlanningRow {
  readonly title: string;
  readonly lotNumber: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly plannedQuantity: number;
  readonly remark: string;
  readonly productSku: string;
  readonly oeeCode: string;
  readonly userEmail: string;
}

export interface ImportPlanningResult {
  success: boolean;
  invalidRows?: ImportPlanningErrorRow[];
}

export interface ImportPlanningErrorRow {
  row: number;
  data: ImportPlanningRow;
  reason: string;
}

export type FilterPlanning = {
  start: Date;
  end: Date;
};
