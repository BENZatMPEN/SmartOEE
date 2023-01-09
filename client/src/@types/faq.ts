import { Attachment } from './attachment';

export type Faq = {
  id: number;
  topic: string;
  description: string;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  startDate: Date;
  endDate: Date;
  createdByUserId: number;
  createdByUser: FaqUser;
  approvedByUserId: number;
  approvedByUser: FaqUser;
  siteId: number;
  status: string;
  attachments: FaqAttachment[];
};

export type EditFaq = {
  topic: string;
  description: string;
  remark: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  createdByUserId: number;
  approvedByUserId: number | null;
  siteId?: number;
  status: string;
  images: File[] | null;
  files: File[] | null;
  deletingAttachments: number[];
};

type FaqUser = {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string;
};

export type FilterFaq = {
  search: string;
  order: string;
  orderBy: string;
  page: number;
  rowsPerPage: number;
  siteId?: number;
};

export type FaqAttachment = {
  faqId: number;
  attachmentId: number;
  groupName: string;
  attachment: Attachment;
};
