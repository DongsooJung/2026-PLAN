export interface DocumentMetadata {
  recipient: string;
  reference: string;
  drafter: string;
  reviewer: string;
  approver: string;
  documentNumber: string;
  enforcementDate: string;
  department: string;
  contactInfo: string;
}

export type ExportFormat = "hwpx" | "docx" | "pdf";

export interface Conversion {
  id: string;
  user_id: string;
  title: string;
  md_content: string;
  document_metadata: DocumentMetadata;
  export_format: ExportFormat | null;
  created_at: string;
  updated_at: string;
}

export type NumberingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface GovDocNode {
  type: "title" | "subtitle1" | "subtitle2" | "body" | "numbered" | "table" | "end-marker" | "metadata-block";
  content: string;
  level?: NumberingLevel;
  index?: number;
  children?: GovDocNode[];
  rows?: string[][];
}

export interface GovDocument {
  metadata: DocumentMetadata;
  nodes: GovDocNode[];
}

export const DEFAULT_METADATA: DocumentMetadata = {
  recipient: "",
  reference: "",
  drafter: "",
  reviewer: "",
  approver: "",
  documentNumber: "",
  enforcementDate: new Date().toISOString().split("T")[0],
  department: "",
  contactInfo: "",
};
