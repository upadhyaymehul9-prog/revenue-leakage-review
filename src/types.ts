import type { AnswerKey, HospitalInputs } from './lib/scoring';

export type { AnswerKey, HospitalInputs };

export interface Response {
  answer: AnswerKey;
  note?: string;
  updatedAt: number;
}

export type ResponseMap = Record<string, Response>;

export interface AuditState {
  version: number;
  responses: ResponseMap;
  inputs: HospitalInputs;
  updatedAt: number | null;
}

export interface LeadInfo {
  name: string;
  hospitalName: string;
  email: string;
  phone?: string;
  capturedAt: number;
}
