// Revenue Leakage question bank — extracted verbatim from the live compiled
// bundle at https://upadhyaymehul9-prog.github.io/revenue-leakage-review/
// (no source existed). 14 sections, 118 questions.
//
// Field notes:
//   severity     : CRITICAL | HIGH | MEDIUM | LOW  (source key: risk)
//   stream       : revenue-stream tag (total/ot/pharmacy/lab/bed/tpa/inventory/opd)
//   effortCode   : q="Quick win"(w1), p="Project"(w.5), i="Investment"(w.25)
//   systemic     : source boolean flag (true on 7 questions)
//   leakagePctMin/Max : estimated revenue-leakage fraction range (source: pctMin/pctMax)
//   evidenceToCheck   : what an auditor should compare (source: ev)
//   howToFix          : one-line recommendation headline (source: fix)
//   howToSteps        : 4-step how-to playbook (source: iu[id])

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EffortCode = 'q' | 'p' | 'i';

export interface LeakageQuestion {
  id: string;
  question: string;
  severity: Severity;
  effortCode: EffortCode;
  systemic: boolean;
  evidenceToCheck: string;
  howToFix: string;
  howToSteps: string[];
  // Systemic questions contribute no direct loss, so these are absent for them.
  stream?: string;
  leakagePctMin?: number;
  leakagePctMax?: number;
}

export interface LeakageSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: LeakageQuestion[];
}

export const REVENUE_LEAKAGE_SECTIONS: LeakageSection[] =
[
  {
    "id": "billing",
    "title": "Billing Leakage",
    "icon": "🧾",
    "description": "Services rendered vs. services charged",
    "questions": [
      {
        "id": "b1",
        "question": "Is there a daily reconciliation between services ordered and services billed?",
        "severity": "CRITICAL",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Doctor order sheet vs. final bill, daily",
        "howToFix": "End-of-day billing reconciliation — doctor order sheet vs. final bill, every day.",
        "howToSteps": [
          "Billing in-charge owns it, runs at day close every day",
          "Compare doctor order sheets vs. final bills line by line; list every unbilled service",
          "Keep a signed daily reconciliation sheet with variances and recovery actions",
          "Ops Head spot-checks one random day each week; variance trend reviewed monthly"
        ]
      },
      {
        "id": "b2",
        "question": "Are OT consumables and surgical packs charged per actual usage (not fixed package)?",
        "severity": "HIGH",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "OT cost per procedure vs. charged amount, last 3 months",
        "howToFix": "Audit OT cost per procedure vs. charged amount for last 3 months. Update package pricing.",
        "howToSteps": [
          "Costing owner: OT in-charge + accounts, quarterly",
          "Pull last 3 months' OT cases; compare actual consumable usage vs. amount charged per procedure type",
          "Keep the costing worksheet per procedure with dates and case counts",
          "Re-run the audit each quarter; any procedure >15% under-charged triggers price revision"
        ]
      },
      {
        "id": "b3",
        "question": "Is the final bill cross-checked against nursing Kardex before discharge?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Nursing Kardex vs. final bill, at discharge",
        "howToFix": "Kardex-vs-bill reconciliation as a mandatory discharge checklist step.",
        "howToSteps": [
          "Discharge desk owns it; nursing supports",
          "Before final bill: tick every Kardex entry (drugs, procedures, consumables) against the bill",
          "Keep the signed Kardex-vs-bill checklist in the discharge file",
          "MD audits 10 random discharge files monthly for checklist completion"
        ]
      },
      {
        "id": "b4",
        "question": "Are hospital tariff rates reviewed and updated at least once a year?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Current tariff vs. last revision date + market rates",
        "howToFix": "Annual tariff revision before each financial year — market rates + cost inflation.",
        "howToSteps": [
          "Named owner: Billing Head, once a year before financial year start",
          "Compare every tariff line vs. 2–3 nearby hospitals and cost inflation; revise with MD approval",
          "Keep the tariff revision note with old rate, new rate, and justification",
          "Check revision date in HIS — if older than 12 months, control has failed"
        ]
      },
      {
        "id": "b5",
        "question": "Is there a defined approval workflow before any discount or waiver is applied?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Discount entries vs. approval log with approver name",
        "howToFix": "Tiered discount policy: front desk → manager → MD. Log every waiver with approver name.",
        "howToSteps": [
          "Front desk requests, manager/MD approves — never self-approved",
          "Set discount limits per role in HIS; above-limit needs approver code before bill closes",
          "Keep the discount register: bill no., amount, reason, approver name",
          "Weekly discount report by user to MD; question any user trending high"
        ]
      },
      {
        "id": "b6",
        "question": "Are implants and high-value devices traced one-to-one from purchase to patient bill?",
        "severity": "CRITICAL",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.02,
        "leakagePctMax": 0.05,
        "evidenceToCheck": "Implant purchase / sticker in file vs. bill line",
        "howToFix": "Implant sticker in patient file + matching bill line. Monthly purchase-vs-billed audit.",
        "howToSteps": [
          "Scrub nurse pastes sticker; billing matches it same day",
          "Every implant: sticker in case file + matching bill line with batch number",
          "Keep sticker file + monthly purchase-vs-billed implant statement",
          "Monthly: implants purchased = implants billed + in stock; any gap investigated"
        ]
      },
      {
        "id": "b7",
        "question": "Are complimentary/free services formally documented and approved?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "Free-service entries vs. complimentary register approvals",
        "howToFix": "Complimentary services register — written approval and reason code for every free service.",
        "howToSteps": [
          "Any free service needs a written approval before delivery",
          "Maintain a complimentary services register with reason codes and sanctioning authority",
          "Keep the register with approver signatures; zero-value bills must reference it",
          "Monthly count of free services by beneficiary reviewed by MD"
        ]
      },
      {
        "id": "b8",
        "question": "Is there a mechanism to catch 'services rendered but not entered in HIS' for night/emergency shifts?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Night/ER service log vs. HIS billing entries, 8am review",
        "howToFix": "Emergency billing log by duty nurse. Billing team reviews at 8am daily.",
        "howToSteps": [
          "Night duty nurse logs; billing reviews at 8am daily",
          "Every night/ER service entered in the emergency billing log before shift ends",
          "Keep the log book signed by both duty nurse and billing reviewer",
          "8am review initialled daily; skipped days visible as blank rows"
        ]
      },
      {
        "id": "b9",
        "question": "Are package deals costed against actual variable costs annually?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Package price vs. actual average variable cost per package",
        "howToFix": "Package cost audit — actual average cost vs. current package price per type.",
        "howToSteps": [
          "Accounts owner, annually per package",
          "Compute actual average variable cost per package from last 12 months' cases",
          "Keep the package costing sheet: cost, price, margin per package",
          "Any package with margin below floor is re-priced or discontinued at annual review"
        ]
      },
      {
        "id": "b10",
        "question": "Is a daily/weekly leakage report reviewed by a senior person (CFO/MD/Ops Head)?",
        "severity": "CRITICAL",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "Daily leakage dashboard with Ops Head/CFO sign-off",
        "howToFix": "1-page daily leakage dashboard — 5 key numbers reviewed every morning by Ops Head.",
        "howToSteps": [
          "Ops Head/CFO owns the daily leakage dashboard",
          "Pick 5 numbers (recon variances, DNFB, rejections, discounts, cash variance); review every morning",
          "Keep the one-page dashboard filed daily with initials",
          "If the dashboard misses 2+ days in a week, escalate to MD — the control is dying"
        ]
      },
      {
        "id": "b11",
        "question": "Does the tariff/service master in HIS have a named owner and a change-approval workflow (no informal edits, no duplicate/orphan service codes)?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Tariff-master change log vs. approval workflow records",
        "howToFix": "Tariff-master governance: one named owner, written change-request workflow, and a quarterly scrub for duplicate/inactive service codes.",
        "howToSteps": [
          "One named owner for the tariff/service master in HIS",
          "All rate changes via written change request; quarterly scrub for duplicate/orphan codes",
          "Keep the change log: who, what, when, approval for every master edit",
          "Quarterly: count of unauthorized changes should be zero; audit trail verified"
        ]
      },
      {
        "id": "b12",
        "question": "Are all charges posted within 24–72 hours of the service (late charges under 2% of total)?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Charge posting timestamps vs. service dates (charge-lag report)",
        "howToFix": "Track charge lag daily by department. Charges older than 3 days escalate to the department head.",
        "howToSteps": [
          "Department heads own their charge lag; billing publishes the report",
          "Post all charges within 24–72h of service; escalate older items daily",
          "Keep the daily charge-lag report by department",
          "Late charges as % of total ≤2%; trend reviewed weekly"
        ]
      }
    ]
  },
  {
    "id": "opd",
    "title": "OPD & Front Office Leakage",
    "icon": "🪪",
    "description": "Consultations, cash handling, and front-desk controls",
    "questions": [
      {
        "id": "op1",
        "question": "Is every OPD consultation billed and receipted before (or immediately after) the patient sees the doctor?",
        "severity": "CRITICAL",
        "stream": "opd",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Doctor's consultation list vs. receipts issued (pay-first flow)",
        "howToFix": "Pay-first OPD flow. No patient enters the consultation room without a receipt number.",
        "howToSteps": [
          "Front desk enforces; doctors support by refusing patients without receipts",
          "Pay-first flow: token/receipt printed before patient enters consultation room",
          "Keep receipt series vs. doctor's patient list, matched daily",
          "Zero patients on doctor lists without receipts — checked in the daily reconciliation"
        ]
      },
      {
        "id": "op2",
        "question": "Is each doctor's OPD patient list reconciled daily against OPD receipts?",
        "severity": "CRITICAL",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Doctor's OPD register / EMR list vs. receipts issued, daily",
        "howToFix": "Daily reconciliation: doctor's OPD register / EMR list vs. receipts issued. Variance investigated same day.",
        "howToSteps": [
          "Billing supervisor runs it every evening",
          "Print each doctor's HIS patient list; tick against receipts issued",
          "Keep the signed daily match sheet with variance notes",
          "Any unmatched encounter investigated within 24h; repeat offenders escalated"
        ]
      },
      {
        "id": "op3",
        "question": "Is there a written free follow-up policy (validity days, number of visits) enforced in the HIS?",
        "severity": "HIGH",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "HIS follow-up validity settings vs. written policy",
        "howToFix": "Define follow-up validity (e.g. 7 days / 1 visit), configure it in HIS — no verbal 'free follow-up'.",
        "howToSteps": [
          "Billing Head defines policy; HIS enforces it",
          "Configure follow-up validity (e.g. 7 days/1 visit) in HIS so eligibility is automatic",
          "Keep the written follow-up policy signed by MD",
          "Weekly exception report: free visits outside validity should be zero"
        ]
      },
      {
        "id": "op4",
        "question": "Is daily cash collection reconciled against HIS receipts by someone other than the cashier?",
        "severity": "CRITICAL",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Cashier closing vs. HIS receipt total, dual-signed daily",
        "howToFix": "Dual-control cash closing: cashier counts, accounts verifies against HIS receipt total, both sign.",
        "howToSteps": [
          "Cashier counts; accounts verifies — two people, always",
          "At day close: physical cash vs. HIS receipt total, both sign the closing sheet",
          "Keep daily closing sheets with both signatures and variance column",
          "Surprise cash count monthly by MD/Ops; variance trend by cashier reviewed"
        ]
      },
      {
        "id": "op5",
        "question": "Are receipt cancellations and refunds logged with reason and approver name?",
        "severity": "HIGH",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Cancellation/refund register with reason code + approver",
        "howToFix": "Cancellation/refund register in HIS — reason code + approver mandatory. Monthly review of patterns.",
        "howToSteps": [
          "Cancellation rights restricted to supervisor with reason code",
          "Every cancellation/refund logged with reason, approver, and time gap from creation",
          "Keep the cancellation register; HIS report of cancellations by user",
          "Weekly review: cancellation rate by user; same-day cancellations after cash receipt = red flag"
        ]
      },
      {
        "id": "op6",
        "question": "Are UPI/card settlements reconciled with HIS collection entries daily?",
        "severity": "MEDIUM",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Gateway settlement report vs. HIS receipts, daily",
        "howToFix": "Daily digital-payment reconciliation: gateway settlement report vs. HIS receipts.",
        "howToSteps": [
          "Accounts reconciles digital payments every morning",
          "Match gateway settlement report vs. HIS UPI/card receipts, transaction by transaction",
          "Keep the daily digital reconciliation sheet",
          "Unmatched transactions >T+2 days escalated; test payment monthly to hospital QR"
        ]
      },
      {
        "id": "op7",
        "question": "Are OPD procedures (dressings, injections, nebulisation, suture removal) charged — not just the consultation?",
        "severity": "HIGH",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Treatment-room procedure register vs. bill lines",
        "howToFix": "OPD procedure rate card at the nursing station; charge slip filled before the procedure is done.",
        "howToSteps": [
          "Treatment room nurse fills charge slip before the procedure",
          "Rate card displayed at nursing station; slip goes to billing with the patient",
          "Keep the treatment room register with receipt numbers",
          "Daily: register entries vs. billed procedures matched; gaps investigated"
        ]
      },
      {
        "id": "op8",
        "question": "Are health camp / free OPD concessions documented, and conversions tracked?",
        "severity": "LOW",
        "stream": "opd",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Camp register with concession codes vs. billing",
        "howToFix": "Camp patient register with concession codes; track camp-to-admission conversion monthly.",
        "howToSteps": [
          "Camp coordinator tags every camp patient in HIS",
          "Camp concessions carry expiry dates; conversions tracked monthly",
          "Keep the camp register with concession codes and validity",
          "Monthly: concession usage after expiry should be zero; conversion rate reported"
        ]
      },
      {
        "id": "op9",
        "question": "Is duplicate patient registration detected and merged (no double UHIDs)?",
        "severity": "LOW",
        "stream": "opd",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.004,
        "evidenceToCheck": "Registration de-dupe report (name + phone + DOB)",
        "howToFix": "Monthly duplicate-registration report from HIS (name + phone + DOB match); merge UHIDs with audit trail.",
        "howToSteps": [
          "Registration desk searches before creating; MRD merges duplicates",
          "Phone number mandatory; search by name+phone+DOB before new UHID",
          "Keep the monthly duplicate report and merge log with audit trail",
          "Duplicate rate <1% of new registrations; merged records verified"
        ]
      }
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency & Ambulance Leakage",
    "icon": "🚑",
    "description": "ER charge capture, admission conversion, ambulance billing",
    "questions": [
      {
        "id": "e1",
        "question": "Are ER observation charges captured based on documented time in/out of the observation area?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "ER observation log (time in/out) vs. billed observation hours",
        "howToFix": "ER observation log with time in/out; billing applies hourly observation charges from the log.",
        "howToSteps": [
          "ER nurse stamps time-in/time-out for every observation patient",
          "Observation log with timestamps; billing computes hours from the log",
          "Keep the observation register; hours billed vs. logged matched daily",
          "Weekly: logged hours = billed hours; unstamped exits investigated"
        ]
      },
      {
        "id": "e2",
        "question": "When an ER patient converts to IPD admission, is billing started from the correct time and category?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "ER-to-IPD conversion list vs. admission billing start date/category",
        "howToFix": "Daily check: every ER-to-IPD conversion has admission billing from actual admission time, correct bed category.",
        "howToSteps": [
          "ER clerk completes conversion billing same shift",
          "Admission billing starts from ER decision-to-admit time, correct bed category",
          "Keep the conversion list: ER arrival, decision time, billing start time",
          "Daily audit of yesterday's conversions; gap >1 hour flagged"
        ]
      },
      {
        "id": "e3",
        "question": "Is every ambulance trip billed — including inter-facility transfers?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0005,
        "leakagePctMax": 0.003,
        "evidenceToCheck": "Trip / driver duty log vs. ambulance billing, daily",
        "howToFix": "Ambulance trip register (driver duty log) reconciled with billing daily. No trip without a bill entry or documented waiver.",
        "howToSteps": [
          "Driver logs every trip; billing reconciles daily",
          "Trip sheet number is a mandatory field on every ambulance bill",
          "Keep the trip register (driver duty log) with bill numbers",
          "Daily: trips in register = ambulance bills + documented waivers"
        ]
      },
      {
        "id": "e4",
        "question": "Are ambulance distances billed from odometer/GPS records (not verbal estimates)?",
        "severity": "LOW",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0003,
        "leakagePctMax": 0.0015,
        "evidenceToCheck": "Odometer / GPS log vs. billed kilometres",
        "howToFix": "Record odometer start/end (or GPS log) on every trip sheet; billing charges from the recorded distance.",
        "howToSteps": [
          "Driver records odometer start/end on every trip sheet",
          "Billing charges from recorded distance, not verbal estimates",
          "Keep trip sheets with odometer/GPS readings",
          "Monthly: fuel consumed vs. km logged per vehicle — mismatch = off-book trips"
        ]
      },
      {
        "id": "e5",
        "question": "Are ambulance waiting time and oxygen usage charged when applicable?",
        "severity": "LOW",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0003,
        "leakagePctMax": 0.0015,
        "evidenceToCheck": "Trip record (waiting time, O2 usage) vs. bill lines",
        "howToFix": "Trip sheet includes waiting time and O2 usage fields; both billed per tariff when applicable.",
        "howToSteps": [
          "Accompanying nurse ticks services on the trip sheet",
          "Waiting time, oxygen, equipment, staff accompaniment — all fields on the sheet",
          "Keep completed trip sheets; billing line per ticked service",
          "Weekly sample: trip sheets vs. bills; ticked-but-unbilled services counted"
        ]
      }
    ]
  },
  {
    "id": "pharmacy",
    "title": "Pharmacy Leakage",
    "icon": "💊",
    "description": "Drug issuance vs. billing reconciliation",
    "questions": [
      {
        "id": "p1",
        "question": "Is there a daily reconciliation between drugs issued and drugs billed?",
        "severity": "CRITICAL",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Pharmacy issue log vs. billed, daily",
        "howToFix": "Daily pharmacy issue-vs-bill reconciliation. Variance >₹500 triggers investigation.",
        "howToSteps": [
          "Pharmacy in-charge runs issue-vs-bill reconciliation daily",
          "Every patient-linked issue must have a bill line within 24h; variance >₹500 investigated",
          "Keep the daily reconciliation sheet signed by pharmacist",
          "Weekly variance trend to Ops Head; unexplained variance = escalation"
        ]
      },
      {
        "id": "p2",
        "question": "Are drug return memos processed and reflected in the final bill?",
        "severity": "HIGH",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Return memos vs. bill credits, before discharge",
        "howToFix": "Mandatory return memo process linked to patient bill before discharge.",
        "howToSteps": [
          "Ward nurse raises return memo; pharmacy credits before discharge",
          "HIS blocks final bill while unapplied return memos exist",
          "Keep return memos matched to bill credit entries",
          "Weekly: open return memos older than 24h should be zero"
        ]
      },
      {
        "id": "p3",
        "question": "Are high-value drugs (antibiotics, oncology, biologics) tracked individually per patient?",
        "severity": "CRITICAL",
        "stream": "pharmacy",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.015,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "Batch-tracking report for drugs >₹500/unit vs. patient bills",
        "howToFix": "Batch-number tracking for drugs >₹500/unit. Monthly issue-vs-billed audit.",
        "howToSteps": [
          "Pharmacist tracks every drug >₹500/unit by batch to patient",
          "Batch number mandatory at issue; monthly issue-vs-billed audit for the tracked list",
          "Keep the high-value drug register with batch, patient, bill number",
          "Monthly: every tracked issue closes as billed or returned; open items investigated"
        ]
      },
      {
        "id": "p4",
        "question": "Is there a break-open vial policy — with the unbilled portion managed or recovered?",
        "severity": "MEDIUM",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Break-open vial log vs. billing/absorption entries",
        "howToFix": "Vial-sharing or cost-absorption protocol. Document every instance.",
        "howToSteps": [
          "Duty nurse documents every break-open vial with witness",
          "Written vial-sharing/cost-absorption protocol; each instance logged",
          "Keep the vial log: drug, patients billed, wastage documented",
          "Monthly wastage report to pharmacy committee; undocumented wastage = variance flag"
        ]
      },
      {
        "id": "p5",
        "question": "Is pharmacy stock audit done monthly and matched against billing records?",
        "severity": "HIGH",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Physical stock count vs. system stock, monthly",
        "howToFix": "Monthly stock audit. Closing = opening + purchases − issues. Variance >2% = red flag.",
        "howToSteps": [
          "Pharmacist + one independent person count monthly",
          "Closing = opening + purchases − issues; variance >2% triggers investigation",
          "Keep monthly stock audit sheets with both signatures",
          "Quarterly surprise count of 20 high-value items by Ops Head"
        ]
      },
      {
        "id": "p6",
        "question": "Is there a defined process for OT/ICU drugs later charged to patients?",
        "severity": "HIGH",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "OT/ICU drug charge sheets vs. bills, within 4 hours",
        "howToFix": "OT/ICU drug charge sheets signed by nurse, sent to billing within 4 hours.",
        "howToSteps": [
          "OT/ICU nurse completes drug charge sheet within 4 hours of use",
          "Charge sheet signed and sent to billing same shift",
          "Keep charge sheets filed with billing acknowledgment",
          "Daily: OT/ICU cases without drug charges flagged automatically"
        ]
      },
      {
        "id": "p7",
        "question": "Are external pharmacy prescriptions tracked and arrangements reviewed?",
        "severity": "LOW",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "External prescription log vs. stock review",
        "howToFix": "Track external prescriptions. Restock high-frequency items to retain revenue.",
        "howToSteps": [
          "Pharmacy logs every prescription sent outside",
          "Track item, reason (stock-out/not stocked), and frequency",
          "Keep the external prescription register",
          "Monthly: high-frequency outside items reviewed for stocking; stock-out repeat rate falls"
        ]
      },
      {
        "id": "p8",
        "question": "Is the pharmacy POS integrated with hospital billing (not manual)?",
        "severity": "HIGH",
        "stream": "pharmacy",
        "effortCode": "i",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Pharmacy POS entries vs. HIS bills (integration report)",
        "howToFix": "Integrate pharmacy POS with HIS. Manual billing is the #1 cause of pharmacy leakage.",
        "howToSteps": [
          "Ops Head owns the integration project; pharmacist owns daily bridge until then",
          "Until POS-HIS integration: daily reconciliation of POS credit sales vs. HIS bills",
          "Keep the daily POS-vs-HIS bridge sheet",
          "Integration live = control automatic; until then, unbridged entries counted daily"
        ]
      },
      {
        "id": "p9",
        "question": "Are narcotic/controlled drug logs cross-verified against patient billing?",
        "severity": "CRITICAL",
        "stream": "pharmacy",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Narcotic register vs. patient billing, monthly",
        "howToFix": "Monthly narcotic register audit by pharmacist + Ops Head. Every vial accounted for.",
        "howToSteps": [
          "Pharmacist + Ops Head audit the narcotic register monthly",
          "Every register administration must match a patient bill line",
          "Keep the narcotic register with monthly audit signatures",
          "Monthly: register entries = bill lines; any gap escalated immediately (legal exposure)"
        ]
      },
      {
        "id": "p10",
        "question": "Is pilferage risk managed — CCTV, dual custody for high-value drugs, surprise audits?",
        "severity": "HIGH",
        "stream": "pharmacy",
        "effortCode": "i",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "CCTV / dual-custody logs + surprise audit reports",
        "howToFix": "CCTV at counters, dual custody for drugs >₹1000/unit, quarterly surprise audit.",
        "howToSteps": [
          "Ops Head owns pilferage controls",
          "CCTV at counters; dual custody for drugs >₹1000/unit; quarterly surprise audits",
          "Keep surprise audit reports and custody logs",
          "Item-wise variance trend by month; persistent variance in portable items = investigation"
        ]
      },
      {
        "id": "p11",
        "question": "Are billed drug rates validated against the current MRP master (no outdated MRPs)?",
        "severity": "MEDIUM",
        "stream": "pharmacy",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Billed rate vs. current MRP master (exception report)",
        "howToFix": "MRP master updated on every purchase batch; monthly exception report of bills where billed rate ≠ current MRP.",
        "howToSteps": [
          "Purchase entry owner updates MRP master per batch at GRN",
          "GRN blocks without batch MRP; billed rate locks to batch MRP",
          "Keep the weekly billed-vs-MRP exception report",
          "Exceptions trend to zero; overcharge exceptions refunded same week"
        ]
      }
    ]
  },
  {
    "id": "ot",
    "title": "OT & Procedure Leakage",
    "icon": "🏥",
    "description": "Surgical and procedure revenue recovery",
    "questions": [
      {
        "id": "o1",
        "question": "Are surgeon fee, anaesthetist fee, and OT charges billed as separate line items?",
        "severity": "HIGH",
        "stream": "ot",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "OT register vs. itemised fee lines per procedure",
        "howToFix": "Itemised procedure bill template for every surgery type, pre-built in HIS.",
        "howToSteps": [
          "Billing builds itemised templates per surgery type in HIS",
          "Surgeon fee, anaesthetist fee, OT charges as separate pre-built lines",
          "Keep procedure billing templates reviewed annually",
          "Sample 10 OT bills monthly: all three components present on each"
        ]
      },
      {
        "id": "o2",
        "question": "Is an OT checklist used to capture all chargeable items before the patient leaves OT?",
        "severity": "HIGH",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Scrub nurse OT checklist vs. bill, within 2 hours",
        "howToFix": "OT billing checklist signed by scrub nurse, submitted to billing within 2 hours.",
        "howToSteps": [
          "Scrub nurse completes OT checklist before patient leaves OT",
          "Checklist covers implants, consumables, equipment, drugs; submitted to billing within 2 hours",
          "Keep signed OT checklists filed per case",
          "Daily: cases without submitted checklists flagged; TAT tracked"
        ]
      },
      {
        "id": "o3",
        "question": "Are add-on procedures (done intra-op, not in original plan) always billed?",
        "severity": "CRITICAL",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.015,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "OT notes / additional-procedure forms vs. bill",
        "howToFix": "'Additional procedure' form completed intra-op. Billing reviews all OT notes vs. bill.",
        "howToSteps": [
          "Surgeon documents add-ons intra-op; billing reviews OT notes vs. bill",
          "Additional-procedure form signed before patient leaves OT",
          "Keep the form attached to the case file and bill",
          "Weekly: sample OT notes vs. bills; documented-but-unbilled procedures counted"
        ]
      },
      {
        "id": "o4",
        "question": "Is OT time (slot booking, overrun) tracked and charged where applicable?",
        "severity": "MEDIUM",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "OT time log vs. billed slot duration",
        "howToFix": "OT time log. Private/corporate patients charged for overrun beyond 30 min.",
        "howToSteps": [
          "OT coordinator logs wheel-in/wheel-out for every case",
          "Overrun beyond 30 min billed per policy for private/corporate patients",
          "Keep the OT time log with billed duration column",
          "Weekly: actual vs. billed duration; unbilled overruns listed"
        ]
      },
      {
        "id": "o5",
        "question": "Are procedure codes reviewed annually against market/insurance rates?",
        "severity": "MEDIUM",
        "stream": "ot",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Procedure rates vs. CGHS / top TPAs / market, annual",
        "howToFix": "Annual rate revision vs. CGHS, top 3 TPAs, and private market.",
        "howToSteps": [
          "Billing Head reviews procedure rates annually",
          "Compare vs. CGHS, top 3 TPAs, and 2–3 market peers",
          "Keep the annual rate comparison sheet with revision decisions",
          "Revision date in HIS ≤12 months old; under-market procedures flagged"
        ]
      },
      {
        "id": "o6",
        "question": "Are day-care procedures fully billed — OT time, recovery, anaesthesia, disposables?",
        "severity": "HIGH",
        "stream": "ot",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Day-care billing template vs. actual services",
        "howToFix": "Day-care billing template with OT, recovery, anaesthesia, disposables as defaults.",
        "howToSteps": [
          "Billing uses the day-care template with defaults on",
          "OT time, recovery, anaesthesia, disposables pre-loaded on every day-care bill",
          "Keep the template; exceptions need documented reason",
          "Monthly sample: day-care bills missing default components = template failure"
        ]
      },
      {
        "id": "o7",
        "question": "Is the anaesthetist's billing reconciled monthly with OT records?",
        "severity": "HIGH",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "OT register vs. anaesthetist fee lines, monthly",
        "howToFix": "Monthly anaesthetist-vs-OT reconciliation. Every procedure has an anaesthetist fee line.",
        "howToSteps": [
          "Anaesthetist submits monthly list; billing reconciles vs. OT register",
          "Every OT case must show an anaesthetist fee line matching technique used",
          "Keep the monthly anaesthesia reconciliation sheet",
          "Monthly: cases without anaesthesia fees = zero; technique billed = technique recorded"
        ]
      },
      {
        "id": "o8",
        "question": "Are in-hospital post-operative consultations charged (not given free)?",
        "severity": "LOW",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Post-op visit log vs. billed consultations",
        "howToFix": "Post-op visits charged per tariff. Free follow-up policy documented and capped.",
        "howToSteps": [
          "Surgeon's free follow-up policy documented and capped",
          "Post-op in-hospital consults billed per tariff beyond the cap",
          "Keep the written policy; billed post-op visits vs. visit log",
          "Monthly sample of post-op patients: visits documented vs. billed"
        ]
      },
      {
        "id": "o9",
        "question": "Are cancelled/postponed procedures reviewed to recover incurred charges?",
        "severity": "MEDIUM",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Cancellation list vs. recovered prep charges",
        "howToFix": "Cancellation policy recovering pre-op prep, anaesthesia consult, bed allocation.",
        "howToSteps": [
          "OT coordinator routes every cancelled case through billing",
          "Cancellation policy defines what is charged (pre-op workup, anaesthesia consult, prep)",
          "Keep the cancelled case register with recovery amounts",
          "Monthly: cancellations with consumed services and zero recovery reviewed"
        ]
      },
      {
        "id": "o10",
        "question": "Are CSSD sterilization cycles costed/charged and instrument sets tracked per OT case?",
        "severity": "LOW",
        "stream": "ot",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.004,
        "evidenceToCheck": "CSSD cycle log & instrument set tracking vs. OT case log",
        "howToFix": "CSSD cycle log linked to OT cases; sterilization cost allocated or charged per case, instrument sets tracked.",
        "howToSteps": [
          "CSSD in-charge links cycle log to OT cases",
          "Sterilization cost allocated per case; instrument sets counted at each handover",
          "Keep cycle logs and set count sheets",
          "Quarterly: set completeness verified; replacement spend trend reviewed"
        ]
      }
    ]
  },
  {
    "id": "lab_radiology",
    "title": "Lab & Radiology Leakage",
    "icon": "🔬",
    "description": "Diagnostics billed vs. reports released",
    "questions": [
      {
        "id": "l1",
        "question": "Is there daily reconciliation between lab tests performed and billed?",
        "severity": "CRITICAL",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "LIS worklist vs. billing, daily",
        "howToFix": "Daily LIS-vs-billing reconciliation. Every released report has a bill entry.",
        "howToSteps": [
          "Lab in-charge reconciles LIS vs. billing daily",
          "Every processed test must have a bill entry; emergency exceptions back-billed within 24h",
          "Keep the daily LIS-vs-billing sheet signed",
          "Weekly: processed-without-bill count trends to zero"
        ]
      },
      {
        "id": "l2",
        "question": "Are radiology reports (X-ray, CT, MRI, USG) reconciled against billing daily?",
        "severity": "HIGH",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "PACS/RIS study count vs. billed studies, daily",
        "howToFix": "PACS/RIS-to-billing reconciliation daily, signed off by radiology in-charge.",
        "howToSteps": [
          "Radiology in-charge signs off PACS-vs-billing daily",
          "Study count in PACS = studies billed, by modality",
          "Keep the daily modality-wise reconciliation sheet",
          "Monthly: machine usage counters vs. billed studies — independent cross-check"
        ]
      },
      {
        "id": "l3",
        "question": "Are outsourced tests tracked for commission recovery from the vendor?",
        "severity": "HIGH",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Vendor invoice vs. outsourced register vs. patient billing",
        "howToFix": "Monthly outsourced test log. Vendor reconciliation before payment.",
        "howToSteps": [
          "Lab manager reconciles vendor invoices line-wise before payment",
          "Every outsourced test: vendor line = patient bill; margins reviewed quarterly",
          "Keep the send-out register with patient bill numbers",
          "Monthly: vendor-paid-but-unbilled tests = zero; negative-margin tests re-priced"
        ]
      },
      {
        "id": "l4",
        "question": "Are stat/urgent charges applied when tests were done on emergency basis?",
        "severity": "MEDIUM",
        "stream": "lab",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Stat test flags vs. surcharge billing",
        "howToFix": "HIS auto-flags stat tests with surcharge. Billing reviews emergency lab bills.",
        "howToSteps": [
          "HIS auto-flags stat tests with surcharge",
          "Night/emergency window surcharges applied from timestamps, not memory",
          "Keep the weekly surcharge exception report",
          "Eligible tests without surcharge trend to zero"
        ]
      },
      {
        "id": "l5",
        "question": "Are repeat tests handled without double-charging or under-charging?",
        "severity": "LOW",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Repeat log with reason code vs. billing",
        "howToFix": "One free repeat for lab error; patient-responsible repeats billed with approval.",
        "howToSteps": [
          "Lab defines repeat policy with reason codes",
          "Lab-error repeats free; patient-caused repeats billed with approval",
          "Keep the repeat log with reason codes",
          "Monthly repeat-rate review — quality indicator and billing check together"
        ]
      },
      {
        "id": "l6",
        "question": "Is home/bedside sample collection charge billed consistently?",
        "severity": "MEDIUM",
        "stream": "lab",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Bedside/home collection list vs. collection fees billed",
        "howToFix": "Collection fee as HIS default add-on for bedside/home samples.",
        "howToSteps": [
          "Collection fee auto-adds on bedside/home flag in HIS",
          "No manual step — the order type drives the fee",
          "Keep the weekly exception report of flagged orders without fees",
          "Exceptions = zero; fee amount reviewed annually"
        ]
      },
      {
        "id": "l7",
        "question": "Are interpretation fees billed separately on high-value tests?",
        "severity": "MEDIUM",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.004,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Signed reports vs. billed interpretation fees",
        "howToFix": "Separate reporting/interpretation fee line for CT, MRI, histopathology.",
        "howToSteps": [
          "Interpretation fees configured per high-value test category",
          "CT/MRI/histopath reports auto-carry the reporting fee line",
          "Keep tariff mapping of tests to interpretation fees",
          "Weekly: eligible reports without fee lines = zero"
        ]
      },
      {
        "id": "l8",
        "question": "Are health check-up packages regularly costed to avoid loss-making pricing?",
        "severity": "HIGH",
        "stream": "lab",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Package price vs. actual cost per package, annual",
        "howToFix": "Annual health package cost review — actual cost vs. price. Adjust or discontinue.",
        "howToSteps": [
          "Accounts costs every package annually against component costs",
          "Reagent + outsourcing + consumables vs. package price",
          "Keep the package costing sheet with margins",
          "Any loss-making package re-priced or discontinued at annual review"
        ]
      },
      {
        "id": "l9",
        "question": "Are lab/radiology reports released only after payment (or approved credit)?",
        "severity": "HIGH",
        "stream": "lab",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Report release log vs. payment status",
        "howToFix": "HIS gate: report release requires paid bill or approved credit flag. Exception report reviewed weekly.",
        "howToSteps": [
          "LIS gate: no report release without paid flag or approved credit",
          "Exception list (credit-approved) maintained by billing head",
          "Keep the weekly released-unpaid exception report",
          "Released-unpaid beyond policy = zero; exceptions all carry approvals"
        ]
      },
      {
        "id": "l10",
        "question": "Are contrast and consumable charges captured on CT/MRI studies?",
        "severity": "HIGH",
        "stream": "lab",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.004,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Contrast usage log vs. bill lines",
        "howToFix": "Contrast usage logged per study by the technician; billing line auto-added for contrast studies.",
        "howToSteps": [
          "Technician logs contrast use per study; billing auto-adds",
          "Contrast-enhanced study codes carry the contrast charge by default",
          "Keep department contrast stock reconciliation weekly",
          "CE studies without contrast lines = zero; stock variance explained"
        ]
      }
    ]
  },
  {
    "id": "bloodbank",
    "title": "Blood Bank Leakage",
    "icon": "🩸",
    "description": "Issue billing, components, crossmatch charges",
    "questions": [
      {
        "id": "bb1",
        "question": "Is every blood/component issue billed before release?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.004,
        "evidenceToCheck": "Blood issue register vs. bills, daily",
        "howToFix": "Issue register reconciled with billing daily. No unit leaves the blood bank without a bill entry.",
        "howToSteps": [
          "Blood bank technician posts charge at issue — single owner",
          "No unit leaves without a bill entry or documented free-issue approval",
          "Keep the issue register with bill numbers",
          "Daily: issues = bills + approved waivers"
        ]
      },
      {
        "id": "bb2",
        "question": "Are issued components (PRBC, FFP, platelets) billed as the component actually issued?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0005,
        "leakagePctMax": 0.002,
        "evidenceToCheck": "Component issued vs. component billed",
        "howToFix": "Component-wise tariff in HIS; issue register entry must match the billed component type.",
        "howToSteps": [
          "Component-wise tariff codes in HIS",
          "Issue entry (PRBC/FFP/platelet) drives the billed component automatically",
          "Keep component issue vs. billed component report",
          "Weekly mismatch count = zero"
        ]
      },
      {
        "id": "bb3",
        "question": "Are crossmatch and screening charges captured for every issue?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0005,
        "leakagePctMax": 0.002,
        "evidenceToCheck": "Crossmatch worklist vs. billed crossmatches",
        "howToFix": "Crossmatch worklist reconciled with billing; charges auto-added with every issue.",
        "howToSteps": [
          "Crossmatch charges auto-add per crossmatch performed",
          "Repeat crossmatches (72h rule, incompatibles) each billed",
          "Keep the crossmatch worklist vs. billed report",
          "Weekly: performed = billed"
        ]
      },
      {
        "id": "bb4",
        "question": "Is the replacement-donor policy enforced and variance tracked?",
        "severity": "LOW",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0002,
        "leakagePctMax": 0.001,
        "evidenceToCheck": "Replacement policy vs. actual unit receipts",
        "howToFix": "Replacement unit register per issue; monthly variance report against policy.",
        "howToSteps": [
          "Blood bank tracks replacement commitments per issue",
          "Replacement deposit taken, refundable on donation within policy days",
          "Keep the replacement register with fulfilment status",
          "Monthly fulfilment % reviewed; unfulfilled commitments charged per policy"
        ]
      }
    ]
  },
  {
    "id": "dialysis",
    "title": "Dialysis & Daycare Leakage",
    "icon": "💉",
    "description": "Sessions, per-session consumables, chemo cycles, packages",
    "questions": [
      {
        "id": "d1",
        "question": "Is every dialysis/daycare session billed against the session register?",
        "severity": "CRITICAL",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Dialysis / daycare register vs. bills, daily",
        "howToFix": "Session register (patient, machine, time) reconciled with billing daily. Every session has a bill entry.",
        "howToSteps": [
          "Unit in-charge reconciles session register vs. bills daily",
          "Machine slot booking requires a bill/authorization number",
          "Keep the session register (patient, machine, time) with bill numbers",
          "Daily: sessions = bills; evening/emergency slots specifically checked"
        ]
      },
      {
        "id": "d2",
        "question": "Are per-session consumables (dialyzers, bloodlines, chemo sets) billed per use or per documented reuse policy?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Session consumable kit list vs. bill",
        "howToFix": "Standard consumable kit list per session type; reuse counted per written policy and billed accordingly.",
        "howToSteps": [
          "Per-session consumable kit list defined per session type",
          "Reuse counted per written policy with patient consent; billing tied to reuse count",
          "Keep the reuse register per dialyzer",
          "Monthly: dialyzer purchases × reuse limit ≥ sessions run; billing matches reuse status"
        ]
      },
      {
        "id": "d3",
        "question": "Is chemotherapy drug usage reconciled — issued vs. administered vs. billed?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Drug issued vs. administered vs. billed, per cycle",
        "howToFix": "Per-cycle chemo sheet: drug issued, dose administered, wastage documented, billed amount — all reconciled.",
        "howToSteps": [
          "Pharmacist reconciles every chemo cycle before closure",
          "Per-cycle sheet: drug issued, dose administered, wastage documented, amount billed",
          "Keep cycle sheets signed by nurse and pharmacist",
          "Any cycle with unexplained issued-vs-billed gap investigated"
        ]
      },
      {
        "id": "d4",
        "question": "Are package session counts tracked so overruns are charged?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0005,
        "leakagePctMax": 0.003,
        "evidenceToCheck": "Package session count vs. sessions delivered",
        "howToFix": "Package session counter in HIS; sessions beyond package trigger additional billing automatically.",
        "howToSteps": [
          "HIS session counter per package patient",
          "Sessions beyond package count auto-trigger additional billing",
          "Keep package terms vs. sessions-delivered report",
          "Weekly: overruns without extra billing = zero"
        ]
      }
    ]
  },
  {
    "id": "bed_charges",
    "title": "Bed, ICU & Accommodation Leakage",
    "icon": "🛏️",
    "description": "Daily charges, upgrades, step-downs, critical-care charges",
    "questions": [
      {
        "id": "bd1",
        "question": "Are bed charges stopped only on the actual discharge date (per written policy)?",
        "severity": "HIGH",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Discharge dates vs. bed-charge stop dates",
        "howToFix": "Bed charge cutoff at 12pm on discharge day, standardised in HIS. No verbal override.",
        "howToSteps": [
          "Written bed-charge cutoff policy (e.g. charge until 12pm on discharge day)",
          "Standardised in HIS; no verbal overrides",
          "Keep the policy; HIS applies it automatically",
          "Monthly sample: discharge dates vs. charge stop dates match policy"
        ]
      },
      {
        "id": "bd2",
        "question": "When a patient steps down ICU → ward, is the charge category updated same day?",
        "severity": "HIGH",
        "stream": "bed",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Transfer register vs. rate-category change timestamps",
        "howToFix": "Nurse-triggered bed category change in HIS at transfer. Billing auto-updated.",
        "howToSteps": [
          "Nurse updates bed category in HIS at physical transfer — both directions",
          "Billing auto-updates from the category change timestamp",
          "Keep the transfer register vs. HIS change log",
          "Daily: transfer-to-update lag >2 hours flagged"
        ]
      },
      {
        "id": "bd3",
        "question": "Are mid-stay room upgrades reflected in billing from the upgrade date?",
        "severity": "MEDIUM",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.004,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Upgrade forms vs. billing change dates",
        "howToFix": "Upgrade form with date/time; billing update triggered immediately.",
        "howToSteps": [
          "Upgrade form with date/time signed by patient/attendant",
          "Billing update triggered immediately, not at discharge",
          "Keep upgrade forms filed with billing confirmation",
          "Weekly: upgrades in nursing records vs. billing change dates"
        ]
      },
      {
        "id": "bd4",
        "question": "Is bed-occupancy reconciled with billing records weekly?",
        "severity": "HIGH",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Nursing census vs. beds billed, weekly",
        "howToFix": "Weekly: nursing census vs. beds billed. Any unbilled occupied bed = flag.",
        "howToSteps": [
          "Nursing census vs. beds billed, reconciled weekly",
          "Both nursing and billing sign the reconciliation",
          "Keep the weekly census-vs-billing sheet",
          "Any unbilled occupied bed investigated same week"
        ]
      },
      {
        "id": "bd5",
        "question": "Are attendant bed charges billed consistently?",
        "severity": "MEDIUM",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.004,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Attendant bed occupancy vs. billed attendant charges",
        "howToFix": "Attendant bed as standard add-on at admission. Front desk reminder at check-in.",
        "howToSteps": [
          "Attendant charge default-on at admission for eligible rooms",
          "Front desk confirms at check-in; removal needs reason",
          "Keep the exception log for waived attendant charges",
          "Weekly: eligible rooms occupied vs. attendant charges billed"
        ]
      },
      {
        "id": "bd6",
        "question": "Is delayed discharge (ready but held by billing/admin) monitored and minimised?",
        "severity": "LOW",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Medical clearance time vs. physical discharge time",
        "howToFix": "Discharge readiness alert. Final bill ready within 2 hours of medical clearance.",
        "howToSteps": [
          "Discharge readiness alert in HIS; billing prepares provisional bill night before",
          "Target: final bill within 2 hours of medical clearance",
          "Keep the discharge TAT report (clearance to exit)",
          "TAT on daily dashboard; >3 hours investigated"
        ]
      },
      {
        "id": "bd7",
        "question": "Are TPA patients' room entitlement levels verified at admission?",
        "severity": "HIGH",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.006,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "TPA entitlement vs. allotted room category, at admission",
        "howToFix": "TPA entitlement check at admission; category difference charged to patient.",
        "howToSteps": [
          "TPA desk verifies entitlement at admission, before room allotment",
          "Category above entitlement needs signed difference-consent",
          "Keep entitlement checks + consents in the TPA file",
          "Capping deductions per month trend to zero"
        ]
      },
      {
        "id": "bd8",
        "question": "Are ventilator hours and ICU monitoring charges captured per actual usage?",
        "severity": "HIGH",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.006,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "Ventilator hours / monitoring orders vs. billed critical-care charges",
        "howToFix": "ICU flow sheet logs ventilator hours and monitoring level; billing reconciled against the flow sheet daily.",
        "howToSteps": [
          "ICU flow sheet logs ventilator hours and monitoring level daily",
          "Billing computed from the flow sheet at day close",
          "Keep flow sheets with billing initials",
          "Daily: logged ventilator/monitoring vs. billed; gaps flagged"
        ]
      }
    ]
  },
  {
    "id": "insurance",
    "title": "Insurance, TPA & Scheme Leakage",
    "icon": "📋",
    "description": "Pre-auth, claims, rejections, government schemes",
    "questions": [
      {
        "id": "i1",
        "question": "Is pre-authorisation escalated when actual cost exceeds the approved amount?",
        "severity": "CRITICAL",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.02,
        "leakagePctMax": 0.05,
        "evidenceToCheck": "Pre-auth approved amount vs. running bill; enhancement requests",
        "howToFix": "Mandatory enhancement request when cost likely to exceed pre-auth by >20%.",
        "howToSteps": [
          "TPA coordinator tracks running bill vs. approved amount daily",
          "Enhancement request mandatory when bill reaches 80% of approval",
          "Keep the active-case tracker with approval headroom column",
          "Settled-below-billed cases without enhancement requests = zero"
        ]
      },
      {
        "id": "i2",
        "question": "Are rejected claims tracked, root-caused, and resubmitted within deadline?",
        "severity": "CRITICAL",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.02,
        "leakagePctMax": 0.05,
        "evidenceToCheck": "Rejection register: reason, owner, resubmission dates",
        "howToFix": "Rejection register: reason, owner, resubmission date. Weekly review. Target 95% resubmission.",
        "howToSteps": [
          "Rejection register: reason, owner, resubmission deadline per claim",
          "Weekly review; resubmission target 95% within window",
          "Keep the register with resubmission dates and outcomes",
          "Monthly: lapsed-window claims = zero; root causes fed back to process"
        ]
      },
      {
        "id": "i3",
        "question": "Are hospital rates renegotiated with major TPAs at least every 2 years?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "TPA rate card dates vs. renegotiation calendar",
        "howToFix": "TPA negotiation calendar with utilisation + cost data prepared in advance.",
        "howToSteps": [
          "Billing Head owns the TPA negotiation calendar",
          "Every contract renegotiated within 24 months with utilisation data prepared",
          "Keep contract dates, rate cards, and negotiation notes",
          "Quarterly: contracts older than 2 years flagged"
        ]
      },
      {
        "id": "i4",
        "question": "Is the cashless discharge process completing within committed TAT?",
        "severity": "MEDIUM",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Cashless approval timestamps vs. TAT target",
        "howToFix": "Cashless TAT tracking: final approval within 4 hours, escalation at 3.",
        "howToSteps": [
          "Cashless TAT tracked per case: submission to final approval",
          "Escalation call at 3 hours; target approval within 4",
          "Keep the TAT log per discharge",
          "Weekly TAT report; pre-approval discharges counted"
        ]
      },
      {
        "id": "i5",
        "question": "Are CGHS/ESI rates updated in HIS per current government notifications?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "HIS rates vs. latest CGHS/ESI notifications",
        "howToFix": "Rate update within 30 days of notification. One named owner.",
        "howToSteps": [
          "One named owner updates CGHS/ESI rates within 30 days of notification",
          "Rate change note filed with notification reference",
          "Keep the rate update log with dates",
          "Quarterly audit: HIS rates vs. latest notifications"
        ]
      },
      {
        "id": "i6",
        "question": "Are non-payable items clearly separated in the bill to avoid deductions?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Bill non-payables vs. FICCI/GIC 203-item list mapping",
        "howToFix": "Map the FICCI/GIC standard 203 excluded-items list into HIS as the non-payable master; bill auto-segregates at generation. Use standard discharge summary templates so TPAs can't delay on format.",
        "howToSteps": [
          "Map the FICCI/GIC 203 excluded-items list into HIS as non-payable master",
          "Bill auto-segregates payer vs. patient share at generation",
          "Keep the non-payable master with quarterly deduction-pattern updates",
          "Monthly: non-payables inside claims trend to zero"
        ]
      },
      {
        "id": "i7",
        "question": "Is there a dedicated TPA coordinator tracking all active cases daily?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "i",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Daily active case tracker with sign-off",
        "howToFix": "Daily active case tracker: pre-auth status, query replies, pending discharge.",
        "howToSteps": [
          "Dedicated TPA coordinator reviews every insured admission each morning",
          "Daily tracker: intimation, pre-auth status, query replies, pending discharges",
          "Keep the daily tracker with sign-off",
          "Intimation TAT compliance and open-query ageing reviewed weekly"
        ]
      },
      {
        "id": "i8",
        "question": "Are partial settlements (TPA pays less than claimed) formally followed up?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Settlement amounts vs. claimed; shortfall queries logged",
        "howToFix": "Partial settlement register. Every shortfall >₹1000 formally queried. Track resolution.",
        "howToSteps": [
          "Every settlement compared line-wise vs. claimed amount",
          "Shortfall >₹1000 formally queried; resolution tracked",
          "Keep the partial settlement register with deduction codes",
          "Monthly: unqueried shortfalls = zero; recovery % reported"
        ]
      },
      {
        "id": "i9",
        "question": "Are government scheme claims (PM-JAY / CGHS / ECHS / state schemes) submitted complete and within the scheme deadline?",
        "severity": "CRITICAL",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "Scheme claim checklist vs. submission TAT, per case",
        "howToFix": "Scheme claim checklist (photos, OT notes, discharge summary) verified before submission; submission TAT tracked per case.",
        "howToSteps": [
          "Scheme claim checklist verified before every submission",
          "Photos, OT notes, discharge summary, vitals — captured at care time, not claim time",
          "Keep the checklist signed per claim with submission date",
          "First-pass acceptance % reviewed monthly; deadline breaches = zero"
        ]
      },
      {
        "id": "i10",
        "question": "Is scheme package selection / coding accuracy reviewed before submission to prevent rejections and penalties?",
        "severity": "HIGH",
        "stream": "tpa",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Second-person package/code review log",
        "howToFix": "Second-person package/code review before every scheme claim. Wrong packages cause rejections, recoveries, and de-empanelment risk.",
        "howToSteps": [
          "Second person reviews package/code selection before submission",
          "Accuracy, not maximisation — over-coding risks de-empanelment",
          "Keep the review log with both signatures",
          "Monthly: coding accuracy sample; downgrades and rejections root-caused"
        ]
      }
    ]
  },
  {
    "id": "inventory",
    "title": "Inventory & Supply Leakage",
    "icon": "📦",
    "description": "Consumables, supplies, store management",
    "questions": [
      {
        "id": "in1",
        "question": "Is inventory consumption linked to patient billing daily (or real-time)?",
        "severity": "CRITICAL",
        "stream": "inventory",
        "effortCode": "i",
        "systemic": false,
        "leakagePctMin": 0.015,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "Store issues vs. patient / cost-centre links, daily",
        "howToFix": "Inventory-to-billing integration. Every indent links to a patient or cost centre.",
        "howToSteps": [
          "Store issues chargeable items only against patient-linked indents",
          "Department-level issues restricted to true overheads",
          "Keep issue register with patient/cost-centre links",
          "Monthly: issued vs. billed by department; unlinked consumption investigated"
        ]
      },
      {
        "id": "in2",
        "question": "Are procedure consumables billed per actual usage (not fixed allowance)?",
        "severity": "HIGH",
        "stream": "inventory",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.01,
        "leakagePctMax": 0.03,
        "evidenceToCheck": "Procedure consumable template vs. actual usage, quarterly",
        "howToFix": "Procedure-specific consumable billing template. Quarterly usage-vs-billed review.",
        "howToSteps": [
          "Procedure-specific consumable templates in HIS",
          "Quarterly usage-vs-billed review per procedure type",
          "Keep the template review sheets",
          "High-variance procedures moved to itemised billing"
        ]
      },
      {
        "id": "in3",
        "question": "Is a monthly physical stock count matched against system records?",
        "severity": "HIGH",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.025,
        "evidenceToCheck": "Physical count vs. system records, monthly",
        "howToFix": "Monthly count in all stores. Variance >3% triggers investigation.",
        "howToSteps": [
          "Store in-charge + independent counter, monthly physical count",
          "Variance >3% (or any high-value item) triggers documented investigation",
          "Keep count sheets with both signatures and investigation notes",
          "Quarterly surprise counts; variance trend reviewed"
        ]
      },
      {
        "id": "in4",
        "question": "Are departmental issues (linen, housekeeping, dietary) tracked against budget?",
        "severity": "MEDIUM",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.005,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "Departmental indents vs. budget, monthly",
        "howToFix": "Departmental indent system + monthly consumption report reviewed by HOD.",
        "howToSteps": [
          "Departmental indents with monthly consumption vs. budget report",
          "HOD reviews their department's consumption monthly",
          "Keep the department consumption reports",
          "Outlier departments investigated; par levels adjusted"
        ]
      },
      {
        "id": "in5",
        "question": "Are returned/unused patient items recovered or credited?",
        "severity": "MEDIUM",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Return memos vs. bill credits",
        "howToFix": "Return policy for sealed items; return memo credited in final bill.",
        "howToSteps": [
          "Return memo drives stock addition AND bill credit together",
          "No one-sided returns — HIS links both entries",
          "Keep the open-return report reviewed weekly",
          "One-sided returns = zero"
        ]
      },
      {
        "id": "in6",
        "question": "Is vendor supply verified against POs before payment (three-way match)?",
        "severity": "HIGH",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.008,
        "leakagePctMax": 0.02,
        "evidenceToCheck": "PO vs. GRN vs. invoice, before payment",
        "howToFix": "PO vs. GRN vs. invoice match before payment. Store manager sign-off mandatory.",
        "howToSteps": [
          "Store manager signs three-way match before any payment",
          "PO vs. GRN vs. invoice — quantity and rate",
          "Keep matched document sets per payment",
          "Monthly: payments without complete matches = zero"
        ]
      },
      {
        "id": "in7",
        "question": "Is expiry monitoring done to prevent write-off losses (FEFO)?",
        "severity": "MEDIUM",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "FEFO / expiry audit reports, monthly",
        "howToFix": "FEFO policy + monthly expiry audit; items expiring <3 months flagged.",
        "howToSteps": [
          "FEFO enforced at issue; monthly expiry audit",
          "Items expiring <3 months flagged for use-first or vendor return",
          "Keep the near-expiry report with actions taken",
          "Avoidable expiry (return window missed) trends to zero"
        ]
      },
      {
        "id": "in8",
        "question": "Are high-value equipment consumables (cathlab, endo, lap) tracked per case?",
        "severity": "CRITICAL",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.015,
        "leakagePctMax": 0.04,
        "evidenceToCheck": "Per-case consumable log vs. bill, before case closure",
        "howToFix": "Per-case consumable log for all high-value suites, linked to bill before case closure.",
        "howToSteps": [
          "Per-case consumable log in every high-value suite",
          "Case cannot close until consumables are billed",
          "Keep case logs linked to bills",
          "Monthly: suite replenishment vs. per-case billing reconciled"
        ]
      },
      {
        "id": "in9",
        "question": "Is negative stock in HIS flagged and investigated (it means unbilled or unrecorded issues)?",
        "severity": "MEDIUM",
        "stream": "inventory",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Negative-stock exception report from HIS",
        "howToFix": "Weekly negative-stock exception report; each instance root-caused (unbilled issue, missed GRN, or theft).",
        "howToSteps": [
          "Weekly negative-stock exception report from HIS",
          "Every negative balance root-caused: missed GRN, wrong unit, or theft cover",
          "Keep root-cause notes per instance",
          "Negative-stock item count trends to zero; force-issue rights restricted"
        ]
      },
      {
        "id": "in10",
        "question": "Is rental/loaner equipment usage tracked and billed per patient, and AMC invoices verified?",
        "severity": "MEDIUM",
        "stream": "inventory",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Rental register & AMC schedule vs. billed usage / vendor invoices",
        "howToFix": "Rental equipment register with per-patient usage billing; AMC invoice verified against contract schedule before payment.",
        "howToSteps": [
          "Rental and AMC register with named owner",
          "Rental usage billed per patient; AMC invoices verified against service reports",
          "Keep the register with utilisation and verification columns",
          "Monthly: idle rentals flagged for return; unverified AMC payments = zero"
        ]
      }
    ]
  },
  {
    "id": "hr_productivity",
    "title": "HR & Productivity Leakage",
    "icon": "👥",
    "description": "Staff productivity and revenue-linked costs",
    "questions": [
      {
        "id": "h1",
        "question": "Is consultant billing reconciled with their actual OPD/procedure visits?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Consultant visit log vs. fees collected vs. share paid",
        "howToFix": "Consultant visit log. Monthly: visits vs. fees collected vs. consultant share.",
        "howToSteps": [
          "Front desk logs every consultant visit; accounts reconciles monthly",
          "Visits vs. fees collected vs. share paid — on realised amounts only",
          "Keep the consultant reconciliation sheet per month",
          "Share basis = realised revenue; overpayments recovered"
        ]
      },
      {
        "id": "h2",
        "question": "Is OPD collection per doctor tracked and reviewed monthly?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "OPD revenue per doctor, monthly",
        "howToFix": "Monthly OPD revenue per doctor; low-revenue slots discussed with consultant.",
        "howToSteps": [
          "Monthly OPD revenue per doctor from HIS",
          "Low-revenue slots discussed with the consultant with data",
          "Keep the doctor-wise revenue report",
          "Trend reviewed monthly; slot changes documented"
        ]
      },
      {
        "id": "h3",
        "question": "Is staff overtime linked to patient volume (not uncontrolled)?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "OT payout vs. patient volume ratio, monthly",
        "howToFix": "Monthly OT payout review; approve only when volume justifies. Track OT:revenue ratio.",
        "howToSteps": [
          "OT payout pre-approved against census triggers",
          "Monthly OT-vs-volume review; person-wise outliers flagged",
          "Keep OT approval records with volume justification",
          "OT:revenue ratio tracked; chronic outliers investigated"
        ]
      },
      {
        "id": "h4",
        "question": "Are contract staff costs reviewed quarterly against productivity?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "Contract cost vs. output, quarterly",
        "howToFix": "Quarterly review: cost per unit of work. Renegotiate or exit.",
        "howToSteps": [
          "Vendor staff on biometric; invoices verified against deployment",
          "Quarterly cost-per-output review per contract",
          "Keep deployment verification sheets per invoice",
          "Phantom headcount = zero; renegotiate or exit underperformers"
        ]
      },
      {
        "id": "h5",
        "question": "Is there a formal process to recover losses from staff errors?",
        "severity": "LOW",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.0005,
        "leakagePctMax": 0.002,
        "evidenceToCheck": "Incident reports vs. recovery entries",
        "howToFix": "Accountability policy: incident report → root cause → recovery where applicable.",
        "howToSteps": [
          "Incident report → root cause → recovery decision documented",
          "Recovery per written accountability policy, not ad-hoc",
          "Keep incident files with recovery outcomes",
          "Quarterly summary of incidents and recoveries to MD"
        ]
      },
      {
        "id": "h6",
        "question": "Is nursing bedside charge capture audited for accuracy?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "20-record sample: charge capture vs. care notes, quarterly",
        "howToFix": "Quarterly audit of 20 patient records: charge capture vs. care notes.",
        "howToSteps": [
          "Quality/billing team audits 20 patient records quarterly",
          "Charge capture vs. care notes, nursing-procedure focus",
          "Keep audit sheets with findings and fixes",
          "Capture rate improves quarter over quarter; misses fed to training"
        ]
      },
      {
        "id": "h7",
        "question": "Is referral commission calculated on verified billed amounts and reconciled?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "Referral register vs. verified billed amounts",
        "howToFix": "Referral register; commission on verified billed amount, monthly reconciliation.",
        "howToSteps": [
          "Referral source captured at registration and verified",
          "Commission computed on verified, realised amounts monthly",
          "Keep the referral register with verification status",
          "Unverified or unrealised-basis payouts = zero"
        ]
      },
      {
        "id": "h8",
        "question": "Is attendance biometric-verified against payroll (no ghost attendance)?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "Biometric attendance vs. payroll",
        "howToFix": "Biometric attendance feeds payroll directly; monthly exception report of payroll entries without biometric records.",
        "howToSteps": [
          "Payroll generated from the biometric feed",
          "Exceptions (field duty, approved leave) documented individually",
          "Keep the monthly biometric-vs-payroll exception report",
          "Paid-without-presence entries = zero"
        ]
      }
    ]
  },
  {
    "id": "receivables",
    "title": "Receivables & Collections",
    "icon": "💳",
    "description": "Credit control, ageing, write-offs, underpayments",
    "questions": [
      {
        "id": "r1",
        "question": "Is an accounts-receivable ageing report (>30/60/90 days) reviewed monthly with named follow-up owners?",
        "severity": "CRITICAL",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.004,
        "leakagePctMax": 0.015,
        "evidenceToCheck": "AR ageing buckets vs. named owners + action dates",
        "howToFix": "Monthly AR ageing review. Every bucket >60 days has a named owner and next action date.",
        "howToSteps": [
          "Accounts publishes ageing monthly; every >60-day balance gets an owner",
          "Named owner + next action date per balance",
          "Keep the ageing report with owner and action columns",
          "Monthly review meeting held; >90-day bucket shrinks month over month"
        ]
      },
      {
        "id": "r2",
        "question": "Are advances/deposits collected at IPD admission per a defined policy?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Admission list vs. deposit receipts",
        "howToFix": "Written deposit policy by ward/procedure category; exceptions need manager approval.",
        "howToSteps": [
          "Deposit matrix by ward/procedure at the admission desk",
          "Below-policy admission needs manager approval code",
          "Keep the deposit compliance report",
          "Compliance % weekly; correlation with bad debt reviewed quarterly"
        ]
      },
      {
        "id": "r3",
        "question": "Are interim bills raised for long-stay patients (every 3–5 days)?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Long-stay patient list vs. interim bills raised",
        "howToFix": "Auto interim bill every 3–5 days for active IPD. Reduces final-bill shock and disputes.",
        "howToSteps": [
          "Auto interim bill every 3–5 days for active IPD",
          "Shared with attendant along with running counselling",
          "Keep interim bills acknowledged in the file",
          "Long-stay patients without interim bills = zero"
        ]
      },
      {
        "id": "r4",
        "question": "Do bad-debt write-offs require documented senior approval?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Write-off register vs. approval matrix",
        "howToFix": "Write-off matrix: amount thresholds → approver level. Quarterly write-off report to MD.",
        "howToSteps": [
          "Write-off matrix: amount thresholds → approver level",
          "Case-by-case review before any write-off; no bulk cleanups",
          "Keep the write-off register with reviews and approvals",
          "Quarterly write-off report to MD; recoverable-share sampled"
        ]
      },
      {
        "id": "r5",
        "question": "Are corporate/credit client payments reconciled invoice-by-invoice against contracts?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Corporate ledger vs. contract invoices, monthly",
        "howToFix": "Corporate ledger reconciled monthly. Short payments queried within 15 days.",
        "howToSteps": [
          "Corporate ledger reconciled invoice-by-invoice monthly",
          "Statements sent to every corporate; short payments queried within 15 days",
          "Keep reconciliation sheets and query letters",
          "Corporate AR beyond credit terms shrinks; disputes resolved with data"
        ]
      },
      {
        "id": "r6",
        "question": "Are payer underpayments vs. agreed tariff detected at payment posting?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "p",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.012,
        "evidenceToCheck": "Posted payments vs. expected contract rates",
        "howToFix": "Post payments against expected contract rate, not billed amount. Auto-flag shortfalls.",
        "howToSteps": [
          "Expected contract rate recorded on every credit invoice",
          "Payment posting requires shortfall coding when amounts differ",
          "Keep the underpayment report by payer",
          "Underpayments detected at posting, not at year-end audit"
        ]
      },
      {
        "id": "r7",
        "question": "Is discharge against pending payment escalated per a defined policy (not ad-hoc)?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.006,
        "evidenceToCheck": "Pending-payment discharges vs. manager sign-offs",
        "howToFix": "Pending-payment discharge needs manager sign-off + payment plan documented.",
        "howToSteps": [
          "Pending-payment discharge needs manager sign-off + payment plan",
          "Undertaking signed; case enters the follow-up worklist",
          "Keep undertakings and the follow-up log",
          "Open-balance discharge recovery % reviewed monthly"
        ]
      },
      {
        "id": "r8",
        "question": "Is the DNFB backlog (discharged-not-final-billed) tracked in days and kept under 5 days?",
        "severity": "HIGH",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.002,
        "leakagePctMax": 0.008,
        "evidenceToCheck": "Daily DNFB report, aged in days",
        "howToFix": "Daily DNFB report: every discharged patient without a final bill, aged in days. Target <5 days (HFMA MAP Keys).",
        "howToSteps": [
          "Daily DNFB report: every discharged patient without a final bill, aged",
          "Named blocker per case (charge sheet, record, approval)",
          "Keep the daily report with blocker column",
          "DNFB >5 days = zero; blockers fixed upstream"
        ]
      },
      {
        "id": "r9",
        "question": "Is HIS revenue reconciled with the accounting ledger monthly?",
        "severity": "MEDIUM",
        "stream": "total",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.001,
        "leakagePctMax": 0.005,
        "evidenceToCheck": "HIS revenue vs. accounting ledger, monthly",
        "howToFix": "Monthly HIS-to-ledger revenue reconciliation; every journal adjustment documented with reason.",
        "howToSteps": [
          "Accounts reconciles HIS revenue vs. ledger monthly",
          "Every journal adjustment documented with reason and approver",
          "Keep the monthly reconciliation with bridge notes",
          "Unexplained adjustments = zero"
        ]
      }
    ]
  },
  {
    "id": "mis_reporting",
    "title": "MIS & Reporting Gaps",
    "icon": "📊",
    "description": "Visibility, accountability, management controls",
    "questions": [
      {
        "id": "m1",
        "question": "Is there a daily revenue dashboard (OPD, IPD, pharmacy, lab)?",
        "severity": "CRITICAL",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "Daily dashboard produced by 9am, with review sign-off",
        "howToFix": "1-page daily revenue dashboard, actual vs. budget by department, ready by 9am.",
        "howToSteps": [
          "MIS owner produces the dashboard by 9am daily",
          "OPD, IPD, pharmacy, lab collections — actual vs. budget",
          "Keep dashboards filed with review initials",
          "Missed days per month = zero; reviewed in morning meeting"
        ]
      },
      {
        "id": "m2",
        "question": "Is a monthly P&L reviewed at department level?",
        "severity": "HIGH",
        "effortCode": "p",
        "systemic": true,
        "evidenceToCheck": "Department P&L reviewed by HODs, monthly",
        "howToFix": "Department-wise P&L: revenue, variable cost, contribution — reviewed by HODs.",
        "howToSteps": [
          "Accounts produces department P&L monthly",
          "Revenue, variable cost, contribution per department; HODs review",
          "Keep P&L packs with meeting minutes",
          "Loss-making departments have action plans with owners"
        ]
      },
      {
        "id": "m3",
        "question": "Is ARPOB (Avg Revenue Per Occupied Bed) tracked monthly?",
        "severity": "HIGH",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "ARPOB computed monthly vs. benchmark",
        "howToFix": "ARPOB = inpatient revenue ÷ occupied bed days. Track monthly, benchmark vs. peers.",
        "howToSteps": [
          "ARPOB computed monthly: inpatient revenue ÷ occupied bed days",
          "Benchmarked against peers and own trend",
          "Keep the monthly ARPOB series",
          "Falling ARPOB triggers case-mix and tariff review"
        ]
      },
      {
        "id": "m4",
        "question": "Is discharge-to-billing time tracked and under 3 hours?",
        "severity": "MEDIUM",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Billing TAT report vs. 3-hour target",
        "howToFix": "Billing TAT tracking, target <3 hours. Long TAT = delayed bed turnover.",
        "howToSteps": [
          "Billing TAT tracked: medical clearance to final bill",
          "Target <3 hours; escalation for breaches",
          "Keep the daily TAT report",
          "TAT trend improves; breaches root-caused"
        ]
      },
      {
        "id": "m5",
        "question": "Is a monthly 'top 10 leakage areas' report reviewed by MD/CEO?",
        "severity": "CRITICAL",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "Monthly top-10 leakage report + MD sign-off",
        "howToFix": "Monthly leakage report with ₹ per area; MD assigns accountability.",
        "howToSteps": [
          "Monthly top-10 leakage report with ₹ per area",
          "MD/CEO reviews and assigns accountability per item",
          "Keep reports with assigned owners and deadlines",
          "Repeat items on consecutive reports = escalation"
        ]
      },
      {
        "id": "m6",
        "question": "Are revenue trends reviewed and deviations investigated?",
        "severity": "HIGH",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "Monthly trend review minutes; >10% drops investigated",
        "howToFix": "Monthly trend review; >10% department drop triggers root-cause investigation.",
        "howToSteps": [
          "Monthly trend review: month-on-month, year-on-year by department",
          "Any >10% drop triggers root-cause investigation",
          "Keep trend packs with investigation notes",
          "Investigations close within the month"
        ]
      },
      {
        "id": "m7",
        "question": "Is a daily bed occupancy report available — and accurate?",
        "severity": "MEDIUM",
        "stream": "bed",
        "effortCode": "q",
        "systemic": false,
        "leakagePctMin": 0.003,
        "leakagePctMax": 0.01,
        "evidenceToCheck": "Nursing census vs. HIS occupancy, daily",
        "howToFix": "Daily census from nursing + HIS crosscheck. Discrepancy = potential leakage.",
        "howToSteps": [
          "Nursing census crosschecked with HIS occupancy daily",
          "Discrepancy = potential leakage or ghost billing",
          "Keep the daily census-vs-HIS sheet",
          "Weekly discrepancy count = zero"
        ]
      },
      {
        "id": "m8",
        "question": "Is one named person accountable for revenue leakage with a monthly KPI?",
        "severity": "CRITICAL",
        "effortCode": "q",
        "systemic": true,
        "evidenceToCheck": "Named owner + monthly leakage KPI in leadership review",
        "howToFix": "Revenue Integrity Manager role (Billing Head/CFO) with leadership-reviewed KPI.",
        "howToSteps": [
          "Revenue Integrity Manager named (Billing Head/CFO)",
          "Monthly leakage KPI reviewed at leadership meeting",
          "Keep the KPI pack and meeting minutes",
          "The role exists, the meeting happens, the KPI moves — checked quarterly"
        ]
      }
    ]
  }
];
