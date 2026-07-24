import { useEffect, useMemo, useRef, useState } from 'react';
import { REVENUE_LEAKAGE_SECTIONS } from './data/revenueLeakageData';
import { computeScore } from './lib/scoring';
import {
  clearState,
  hasLead,
  loadState,
  sanitizeResponses,
  saveState,
} from './lib/storage';
import type { AnswerKey, HospitalInputs, ResponseMap } from './types';
import AuditShell from './components/AuditShell';
import QuestionCard from './components/QuestionCard';
import Report from './components/Report';
import EmailGate from './components/EmailGate';

type View = 'audit' | 'report';
const SECTIONS = REVENUE_LEAKAGE_SECTIONS;
const TOTAL_QUESTIONS = SECTIONS.reduce((n, s) => n + s.questions.length, 0);

export default function App() {
  const [responses, setResponses] = useState<ResponseMap>(
    () => loadState().responses,
  );
  const [inputs, setInputs] = useState<HospitalInputs>(() => loadState().inputs);
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const [view, setView] = useState<View>('audit');
  const [leadCaptured, setLeadCaptured] = useState<boolean>(() => hasLead());
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    () => loadState().updatedAt,
  );
  const isFirstRender = useRef(true);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const now = Date.now();
    saveState({ version: 1, responses, inputs, updatedAt: now });
    setLastSavedAt(now);
  }, [responses, inputs]);

  const answers = useMemo(() => {
    const out: Record<string, AnswerKey> = {};
    for (const [id, r] of Object.entries(responses)) out[id] = r.answer;
    return out;
  }, [responses]);

  const result = useMemo(
    () => computeScore(SECTIONS, answers, inputs),
    [answers, inputs],
  );

  const completion = useMemo(
    () => (TOTAL_QUESTIONS === 0 ? 0 : Object.keys(responses).length / TOTAL_QUESTIONS),
    [responses],
  );

  const activeSection =
    SECTIONS.find((s) => s.id === activeSectionId) ?? SECTIONS[0];

  const handleAnswer = (questionId: string, answer: AnswerKey, note?: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { answer, note, updatedAt: Date.now() },
    }));
  };

  const handleInputsChange = (patch: Partial<HospitalInputs>) => {
    setInputs((prev) => {
      const next: HospitalInputs = { ...prev, ...patch };
      (Object.keys(next) as (keyof HospitalInputs)[]).forEach((k) => {
        const v = next[k];
        if (v === undefined || Number.isNaN(v)) delete next[k];
      });
      return next;
    });
  };

  const handleExport = () => {
    const payload = JSON.stringify(
      { version: 1, responses, inputs, exportedAt: Date.now() },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `hospital-revenue-leakage-audit-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => importInputRef.current?.click();

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          responses?: unknown;
        };
        setResponses(sanitizeResponses(parsed.responses));
      } catch {
        // ignore invalid file; leave current answers untouched
      }
    };
    reader.readAsText(file);
  };

  const doReset = () => {
    clearState();
    setResponses({});
    setInputs({});
    setLastSavedAt(null);
    setConfirmReset(false);
    setView('audit');
    setActiveSectionId(SECTIONS[0].id);
  };

  if (view === 'report') {
    if (!leadCaptured) {
      return (
        <EmailGate
          result={result}
          onSubmit={() => setLeadCaptured(true)}
          onBack={() => setView('audit')}
        />
      );
    }
    return <Report result={result} onBack={() => setView('audit')} />;
  }

  return (
    <>
      <AuditShell
        sections={SECTIONS}
        activeSectionId={activeSection.id}
        result={result}
        completion={completion}
        inputs={inputs}
        lastSavedAt={lastSavedAt}
        onSelect={setActiveSectionId}
        onInputsChange={handleInputsChange}
        onReset={() => setConfirmReset(true)}
        onReport={() => setView('report')}
        onExport={handleExport}
        onImportClick={handleImportClick}
      >
        <section className="section-intro">
          <h2>
            {activeSection.icon} {activeSection.title}
          </h2>
          <p>{activeSection.description}</p>
          <p className="section-intro__meta">
            {activeSection.questions.length} controls in this area · Open “How to
            fix” on any question if you don’t know where to start
          </p>
        </section>
        <div className="question-list">
          {activeSection.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              index={i + 1}
              question={q}
              response={responses[q.id]}
              onChange={(answer, note) => handleAnswer(q.id, answer, note)}
            />
          ))}
        </div>
      </AuditShell>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = '';
        }}
      />

      {confirmReset && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Reset this audit?</h3>
            <p>All answers and hospital inputs stored in this browser will be cleared.</p>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn--danger" onClick={doReset}>
                Confirm reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
