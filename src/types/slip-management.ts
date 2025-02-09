export interface Field {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlipTemplate {
  id: string;
  name: string;
  fields: Field[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldRequest {
  name: string;
}

export interface UpdateFieldRequest {
  name: string;
}

export interface CreateTemplateRequest {
  name: string;
  fieldIds: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  fieldIds?: string[];
}

export interface SlipData {
  id: string;
  templateId: string;
  values: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlipDataRequest {
  templateId: string;
  values: Record<string, string>;
}

export interface UpdateSlipDataRequest {
  values: Record<string, string>;
}