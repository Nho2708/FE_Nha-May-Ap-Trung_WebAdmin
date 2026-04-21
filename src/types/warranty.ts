export type WarrantyStatus = "active" | "expiring" | "expired";
export type TechnicalIssueStatus = "reported" | "in-progress" | "resolved";

export interface TechnicalIssue {
  issueId: string;
  issueDate: string;
  issueType: string;
  description: string;
  status: TechnicalIssueStatus;
  resolutionDate?: string;
  notes?: string;
}

export interface WarrantyProduct {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  warrantyEndDate: string;
  warrantyStatus: WarrantyStatus;
  serviceCounts: number;
  maxServiceAllowed: number;
  issues: TechnicalIssue[];
}
