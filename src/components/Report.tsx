import { REVENUE_LEAKAGE_SECTIONS } from '../data/revenueLeakageData';
import {
  type ScoreResult,
  ANSWER_UI,
  EFFORT_LABEL,
  formatINR,
} from '../lib/scoring';

interface ReportProps {
  result: ScoreResult;
  onBack: () => void;
}

const SECTION_TITLE = new Map(
  REVENUE_LEAKAGE_SECTIONS.map((s) => [s.id, s.title]),
);

export default function Report({ result, onBack }: ReportProps) {
  const answered = result.sectionScores.reduce((n, s) => n + s.answered, 0);
  const total = result.sectionScores.reduce((n, s) => n + s.total, 0);

  // All gaps across sections, worst money first.
  const gaps = result.sectionScores
    .flatMap((s) => s.gaps.map((g) => ({ ...g, sectionId: s.id })))
    .sort((a, b) => b.lMax - a.lMax);

  return (
    <div className="report">
      <div className="report__top no-print">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Back to questionnaire
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>

      <header className="report__header">
        <p className="report__eyebrow">Hospital revenue-leakage self-assessment</p>
        <h2>Your revenue leakage report</h2>

        <div className="report__summary-grid">
          <div className="summary-card">
            <span className="summary-card__label">Estimated annual leakage</span>
            <span className="summary-card__big summary-card__big--loss">
              {formatINR(result.lossMin)} – {formatINR(result.lossMax)}
            </span>
            <p className="summary-card__desc">
              Money at risk each year across the areas you flagged.
              {result.capped && ' Capped at 20% of annual revenue.'}
            </p>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Control readiness</span>
            <span className={`health-badge health-badge--lvl${result.band.lvl}`}>
              {result.band.name} · {result.readinessPct}%
            </span>
            <p className="summary-card__desc">
              How well your revenue controls are documented and enforced.
            </p>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Coverage</span>
            <span className="summary-card__big">
              {answered}/{total}
            </span>
            <p className="summary-card__desc">
              Questions answered. Answer more to sharpen the estimate.
              {result.sysMult > 1 &&
                ` Systemic-gap multiplier ×${result.sysMult.toFixed(2)} applied.`}
            </p>
          </div>
        </div>

        <p className="report__disclaimer">
          This is a screening estimate based on typical hospital revenue-leakage
          ranges scaled to your inputs — not an audit finding or a guaranteed
          figure. Validate against your own HIS and finance records.
        </p>
      </header>

      {result.flags.length > 0 && (
        <section className="report__section">
          <h3>⚠️ Answers that contradict each other</h3>
          <ul className="flag-list">
            {result.flags.map((f) => (
              <li key={`${f.a}-${f.b}`} className="flag-item">
                <strong>{f.label}</strong>
                <span className="flag-item__detail">
                  {ANSWER_UI[f.ansA].label} vs {ANSWER_UI[f.ansB].label} — worth a
                  second look.
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="report__section">
        <h3>Leakage by area</h3>
        <div className="report__dept-grid">
          {result.sectionScores.map((s) => (
            <div key={s.id} className="dept-card">
              <span className="dept-card__name">{SECTION_TITLE.get(s.id)}</span>
              <span className="dept-card__loss">
                {s.lossMax > 0
                  ? `${formatINR(s.lossMin)}–${formatINR(s.lossMax)}`
                  : '—'}
              </span>
              <span className="dept-card__count">
                readiness {s.answered > 0 ? `${s.readinessPct}%` : 'n/a'} ·{' '}
                {s.answered}/{s.total} answered
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="report__section">
        <h3>Priority gaps to plug</h3>
        {gaps.length === 0 ? (
          <p className="report__empty">
            Answer questions with anything other than “Yes — with evidence” to
            surface leakage gaps here.
          </p>
        ) : (
          <ol className="report__actions">
            {gaps.slice(0, 12).map((g) => (
              <li key={g.id} className="action-item">
                <div className="action-item__head">
                  <span className={`badge badge--${g.severity.toLowerCase()}`}>
                    {g.severity}
                  </span>
                  <span className={`effort-chip effort-chip--${g.effortCode}`}>
                    {EFFORT_LABEL[g.effortCode] ?? g.effortCode}
                  </span>
                  <span className="action-item__section">
                    {SECTION_TITLE.get(g.sectionId)}
                  </span>
                  <span className="action-item__loss">
                    {formatINR(g.lMin)}–{formatINR(g.lMax)}/yr
                  </span>
                </div>
                <p className="action-item__text">{g.question}</p>
                <div className="action-item__howto">
                  <strong>How to fix:</strong>
                  <p>{g.howToFix}</p>
                  <ol>
                    {g.howToSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <p className="action-item__owner">
                  Evidence to check: {g.evidenceToCheck}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
