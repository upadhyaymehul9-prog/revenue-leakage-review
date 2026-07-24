import type { ReactNode } from 'react';
import type { LeakageSection } from '../data/revenueLeakageData';
import type { HospitalInputs } from '../types';
import { type ScoreResult, formatINR } from '../lib/scoring';

interface AuditShellProps {
  sections: LeakageSection[];
  activeSectionId: string;
  result: ScoreResult;
  completion: number;
  inputs: HospitalInputs;
  lastSavedAt: number | null;
  children: ReactNode;
  onSelect: (id: string) => void;
  onInputsChange: (patch: Partial<HospitalInputs>) => void;
  onReset: () => void;
  onReport: () => void;
  onExport: () => void;
  onImportClick: () => void;
}

function formatSavedAt(ts: number | null): string {
  if (ts === null) return 'Not saved yet';
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return 'Saved just now';
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `Saved ${mins} min ago`;
  return `Saved ${new Date(ts).toLocaleString()}`;
}

const INPUT_FIELDS: { key: keyof HospitalInputs; label: string; placeholder: string }[] = [
  { key: 'revenueLakh', label: 'Annual revenue (₹ lakh)', placeholder: 'e.g. 5000' },
  { key: 'beds', label: 'Number of beds', placeholder: 'e.g. 120' },
  { key: 'pharmacyLakh', label: 'Pharmacy revenue (₹ lakh)', placeholder: 'optional' },
  { key: 'tpaPct', label: 'TPA / insurance share (%)', placeholder: 'default 35' },
];

export default function AuditShell({
  sections,
  activeSectionId,
  result,
  completion,
  inputs,
  lastSavedAt,
  children,
  onSelect,
  onInputsChange,
  onReset,
  onReport,
  onExport,
  onImportClick,
}: AuditShellProps) {
  const pct = Math.round(completion * 100);
  const meta = new Map(result.sectionScores.map((s) => [s.id, s]));

  return (
    <div className="audit-shell">
      <header className="audit-header">
        <div className="audit-header__brand">
          <span className="audit-header__mark">₹</span>
          <div>
            <h1>Hospital Revenue Leakage Self-Audit</h1>
            <p className="audit-header__sub">
              Where hospital revenue quietly leaks — and how to plug it
            </p>
          </div>
        </div>

        <div className="audit-header__scores">
          <div className="score-pill">
            <span className="score-pill__label">Readiness</span>
            <span
              className={`score-pill__value score-pill__value--lvl${result.band.lvl}`}
            >
              {result.band.name} · {result.readinessPct}%
            </span>
          </div>
          <div className="score-pill">
            <span className="score-pill__label">Est. annual leakage</span>
            <span className="score-pill__value score-pill__value--loss">
              {formatINR(result.lossMin)}–{formatINR(result.lossMax)}
            </span>
          </div>
          <div className="score-pill">
            <span className="score-pill__label">Completion</span>
            <span className="score-pill__value">{pct}%</span>
          </div>
        </div>

        <div className="audit-header__actions">
          <span className="audit-header__saved">{formatSavedAt(lastSavedAt)}</span>
          <button type="button" className="btn btn--ghost" onClick={onImportClick}>
            Import
          </button>
          <button type="button" className="btn btn--ghost" onClick={onExport}>
            Export
          </button>
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="btn btn--primary" onClick={onReport}>
            View Report
          </button>
        </div>
      </header>

      <div className="audit-body">
        <nav className="sidebar" aria-label="Audit sections">
          <div className="sidebar__group">Your hospital</div>
          <div className="hospital-inputs">
            {INPUT_FIELDS.map((f) => (
              <label key={f.key} className="hospital-inputs__field">
                <span>{f.label}</span>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={inputs[f.key] ?? ''}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    const v = e.target.value;
                    onInputsChange({
                      [f.key]: v === '' ? undefined : Number(v),
                    });
                  }}
                />
              </label>
            ))}
            <p className="hospital-inputs__note">
              {result.sizeAssumed
                ? 'No size entered — using a default ₹1.5 Cr baseline. Enter revenue or beds for a tailored estimate.'
                : 'Estimates scale to the figures above. Leave blank to use defaults.'}
            </p>
          </div>

          <div className="sidebar__group sidebar__group--divider">Sections</div>
          {sections.map((section) => {
            const m = meta.get(section.id);
            const active = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                type="button"
                className={`sidebar__item ${active ? 'is-active' : ''}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(section.id)}
              >
                <span className="sidebar__icon">{section.icon}</span>
                <span className="sidebar__label">{section.title}</span>
                <span className="sidebar__count">
                  {m?.answered ?? 0}/{m?.total ?? section.questions.length}
                </span>
              </button>
            );
          })}
        </nav>

        <main className="audit-content">{children}</main>
      </div>
    </div>
  );
}
