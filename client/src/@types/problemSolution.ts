import { Attachment } from './attachment';

export type ProblemSolution = {
  id: number;
  name: string;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  date: Date;
  startDate: Date;
  endDate: Date;
  headProjectUserId: number;
  headProjectUser: ProblemSolutionUser;
  approvedByUserId: number;
  approvedByUser: ProblemSolutionUser;
  oeeId: number;
  oee: ProblemSolutionOee;
  siteId: number;
  status: string;
  attachments: ProblemSolutionAttachment[];
  tasks: ProblemSolutionTask[];
};

export type ProblemSolutionPagedList = {
  list: ProblemSolution[];
  count: number;
};

type ProblemSolutionUser = {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string | null;
};

type ProblemSolutionOee = {
  id: number;
  productionName: string;
};

export interface EditProblemSolution {
  name: string;
  remark: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  headProjectUserId: number;
  approvedByUserId: number;
  oeeId: number;
  status: string;
  deletingAttachments: number[];
  beforeProjectChartImages: File[] | null;
  beforeProjectImages: File[] | null;
  afterProjectChartImages: File[] | null;
  afterProjectImages: File[] | null;
}

export type FilterProblemSolution = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
};

export type ProblemSolutionAttachment = {
  problemSolutionId: number;
  attachmentId: number;
  groupName: string;
  attachment: Attachment;
};

export type ProblemSolutionTask = {
  id: number;
  title: string;
  assigneeUserId: number;
  assigneeUser: ProblemSolutionUser;
  startDate: Date;
  endDate: Date;
  status: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  problemSolutionId: number;
  attachments: ProblemSolutionTaskAttachment[];
};

export type EditProblemSolutionTask = {
  id: number | null;
  title: string;
  assigneeUserId: number | null;
  startDate: Date;
  endDate: Date;
  status: string;
  comment: string;
  problemSolutionId?: number;
  attachments: ProblemSolutionTaskAttachment[];
  files: string[];
  addingFiles: File[];
  deletingFiles: number[];
};

export type ProblemSolutionTaskAttachment = {
  problemSolutionTaskId: number;
  attachmentId: number;
  groupName: string;
  attachment: Attachment;
};
