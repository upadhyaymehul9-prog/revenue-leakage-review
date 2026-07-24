import type { LeakageQuestion } from '../data/revenueLeakageData';
import type { AnswerKey, Response } from '../types';
import { ANSWER_ORDER, ANSWER_UI, EFFORT_LABEL } from '../lib/scoring';

interface QuestionCardProps {
  index: number;
  question: LeakageQuestion;
  response?: Response;
  onChange: (answer: AnswerKey, note?: string) => void;
}

export default function QuestionCard({
  index,
  question,
  response,
  onChange,
}: QuestionCardProps) {
  return (
    <article className="question-card">
      <header className="question-card__header">
        <span className="question-card__number">Q{index}</span>
        <span className={`badge badge--${question.severity.toLowerCase()}`}>
          {question.severity}
        </span>
        <span className={`effort-chip effort-chip--${question.effortCode}`}>
          {EFFORT_LABEL[question.effortCode] ?? question.effortCode}
        </span>
        {question.systemic && (
          <span className="systemic-tag" title="Systemic control — a weak answer amplifies the whole estimate">
            Systemic
          </span>
        )}
      </header>
      <p className="question-card__text">{question.question}</p>

      <p className="question-card__prompt">Select your answer:</p>
      <div className="answer-options" role="group" aria-label="Answer options">
        {ANSWER_ORDER.map((value) => {
          const selected = response?.answer === value;
          return (
            <button
              key={value}
              type="button"
              className={`answer-option answer-option--${value} ${
                selected ? 'is-selected' : ''
              }`}
              aria-pressed={selected}
              title={ANSWER_UI[value].hint}
              onClick={() => onChange(value, response?.note)}
            >
              {ANSWER_UI[value].label}
            </button>
          );
        })}
      </div>

      <div className="question-card__evidence">
        <strong>Evidence to check:</strong> {question.evidenceToCheck}
      </div>

      <details className="how-to">
        <summary>How to fix this</summary>
        <p className="how-to__summary">{question.howToFix}</p>
        <ol className="how-to__steps">
          {question.howToSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>

      <label className="question-card__note">
        <span>Auditor notes / evidence location (optional)</span>
        <textarea
          value={response?.note ?? ''}
          placeholder="e.g. HIS reconciliation report 12 Mar · Shared Drive / Finance / leakage.xlsx"
          onChange={(e) => onChange(response?.answer ?? 'partial', e.target.value)}
          disabled={!response?.answer}
        />
      </label>
    </article>
  );
}
