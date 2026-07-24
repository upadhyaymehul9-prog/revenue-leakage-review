import type { AuditState, HospitalInputs, LeadInfo, Response, ResponseMap } from '../types';

export const STORAGE_KEY = 'hospital-revenue-leakage-audit:v1';
export const LEAD_STORAGE_KEY = 'hospital-revenue-leakage-audit:lead:v1';
const SCHEMA_VERSION = 1;

const VALID_ANSWERS = ['evidence', 'nodoc', 'partial', 'no', 'na'];

export const emptyState = (): AuditState => ({
  version: SCHEMA_VERSION,
  responses: {},
  inputs: {},
  updatedAt: null,
});

function isValidResponse(v: unknown): v is Response {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  if (!VALID_ANSWERS.includes(c.answer as string)) return false;
  if (c.note !== undefined && typeof c.note !== 'string') return false;
  return typeof c.updatedAt === 'number';
}

export function sanitizeResponses(raw: unknown): ResponseMap {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: ResponseMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (isValidResponse(v)) out[k] = v;
  }
  return out;
}

function sanitizeInputs(raw: unknown): HospitalInputs {
  if (typeof raw !== 'object' || raw === null) return {};
  const c = raw as Record<string, unknown>;
  const out: HospitalInputs = {};
  for (const key of ['revenueLakh', 'beds', 'pharmacyLakh', 'tpaPct'] as const) {
    const val = c[key];
    if (typeof val === 'number' && isFinite(val)) out[key] = val;
  }
  return out;
}

export function loadState(): AuditState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return emptyState();
    const c = parsed as Record<string, unknown>;
    if (c.version !== SCHEMA_VERSION) return emptyState();
    return {
      version: SCHEMA_VERSION,
      responses: sanitizeResponses(c.responses),
      inputs: sanitizeInputs(c.inputs),
      updatedAt: typeof c.updatedAt === 'number' ? c.updatedAt : null,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AuditState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasLead(): boolean {
  try {
    return localStorage.getItem(LEAD_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function saveLead(lead: LeadInfo): void {
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // ignore quota / private mode
  }
}

export function clearLead(): void {
  try {
    localStorage.removeItem(LEAD_STORAGE_KEY);
  } catch {
    // ignore
  }
}
