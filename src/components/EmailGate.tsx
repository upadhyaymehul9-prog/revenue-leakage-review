import { useState, type FormEvent } from 'react';
import type { LeadInfo } from '../types';
import { type ScoreResult, formatINR } from '../lib/scoring';
import { supabase } from '../lib/supabase';
import { saveLead } from '../lib/storage';

interface EmailGateProps {
  result: ScoreResult;
  onSubmit: (lead: LeadInfo) => void;
  onBack: () => void;
}

const BLOCKED_HOSPITAL_NAMES = new Set(['test', 'abc', 'new']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailGate({ result, onSubmit, onBack }: EmailGateProps) {
  const [name, setName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const answered = result.sectionScores.reduce((n, s) => n + s.answered, 0);
  const total = result.sectionScores.reduce((n, s) => n + s.total, 0);

  const teaser =
    result.lossMax > 0
      ? `Your estimated annual revenue leakage is ${formatINR(result.lossMin)}–${formatINR(result.lossMax)}. Enter your details to see the full breakdown.`
      : 'Answer a few questions to estimate your revenue leakage, then enter your details to unlock the full report.';

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please enter your name.';

    const hn = hospitalName.trim();
    if (!hn) next.hospitalName = 'Please enter your hospital name.';
    else if (hn.length < 3)
      next.hospitalName = 'Hospital name must be at least 3 characters.';
    else if (BLOCKED_HOSPITAL_NAMES.has(hn.toLowerCase()))
      next.hospitalName = 'Please enter your hospital’s real name.';

    const em = email.trim();
    if (!em) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(em))
      next.email = 'Please enter a valid email address.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    const lead: LeadInfo = {
      name: name.trim(),
      hospitalName: hospitalName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      capturedAt: Date.now(),
    };

    // 1) Save to Supabase first.
    try {
      if (!supabase) throw new Error('Supabase is not configured');
      const { error } = await supabase.from('revenue_leakage_leads').insert({
        name: lead.name,
        hospital_name: lead.hospitalName,
        email: lead.email,
        phone: lead.phone ?? null,
        readiness_score: result.readinessPct,
        readiness_band: result.band.name,
        estimated_loss_min: result.lossMin,
        estimated_loss_max: result.lossMax,
        answered_count: answered,
        total_count: total,
      });
      if (error) throw error;
    } catch {
      setSubmitting(false);
      setSubmitError(
        'We couldn’t save your details. Please check your connection and try again.',
      );
      return; // stay gated so the lead isn’t lost
    }

    // 2) Then persist locally so we don’t re-gate this browser.
    saveLead(lead);

    // 3) Then unlock the report.
    onSubmit(lead);
  };

  return (
    <div className="email-gate">
      <div className="email-gate__card">
        <button
          type="button"
          className="btn btn--ghost email-gate__back"
          onClick={onBack}
        >
          ← Back to questionnaire
        </button>

        <p className="report__eyebrow">Your report is ready</p>
        <h2 className="email-gate__teaser">{teaser}</h2>
        <p className="email-gate__sub">
          {answered}/{total} questions answered · No spam — we’ll only use this to
          send your report and follow up.
        </p>

        <form className="email-gate__form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Name *</span>
            <input
              className="field__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field__label">Hospital name *</span>
            <input
              className="field__input"
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              autoComplete="organization"
            />
            {errors.hospitalName && (
              <span className="field__error">{errors.hospitalName}</span>
            )}
          </label>

          <label className="field">
            <span className="field__label">Work email *</span>
            <input
              className="field__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </label>

          <label className="field">
            <span className="field__label">Phone (optional)</span>
            <input
              className="field__input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>

          {submitError && <p className="field__error">{submitError}</p>}

          <button
            type="submit"
            className="btn btn--primary email-gate__submit"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Unlock my full report'}
          </button>
        </form>
      </div>
    </div>
  );
}
