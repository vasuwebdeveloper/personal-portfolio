/**
 * NACHA (ACH) file validation types.
 *
 * Pure data shapes shared by the parser (lib/nacha/parse.ts), the NetSuite
 * hint layer (lib/nacha/netsuite-hints.ts), and the client UI. No imports
 * from /content and no runtime dependencies, so everything here runs
 * unchanged in the browser.
 */

export type Severity = "error" | "warning";

/** One validation result, anchored to a spot in the file. */
export interface Finding {
  /** Stable machine code, e.g. "ED-ROUTING-CHECK-DIGIT". Hint lookup key. */
  code: string;
  severity: Severity;
  /** 1-based line number in the submitted file. */
  line: number;
  /** Human name of the field the finding is about, e.g. "Amount". */
  field: string;
  /** 1-based character position where the field starts (inclusive). */
  start: number;
  /** 1-based character position where the field ends (inclusive). */
  end: number;
  /** Plain-English explanation of what is wrong. */
  message: string;
}

/** One decoded entry detail (type-6) record, for the payments table. */
export interface Payment {
  /** 1-based line number of the entry detail record. */
  line: number;
  /** Receiver / payee name (positions 55-76), trimmed. */
  name: string;
  /** Amount in cents. 0 when the amount field is not numeric. */
  amountCents: number;
  /** True when the amount field parsed as digits. */
  amountValid: boolean;
  /** RDFI routing number as written (positions 4-12). */
  routing: string;
  /** Two-digit transaction code (positions 2-3). */
  transactionCode: string;
  direction: "credit" | "debit" | "unknown";
  /** True for prenotification (zero-dollar test) entries. */
  prenote: boolean;
  /** Trace number as written (positions 80-94). */
  traceNumber: string;
}

export interface ValidationStats {
  errorCount: number;
  warningCount: number;
  /** Number of entry detail (type-6) records. */
  paymentCount: number;
  /** Sum of all parsed entry amounts, in cents (credits + debits). */
  totalCents: number;
  creditCents: number;
  debitCents: number;
  batchCount: number;
  /** Total lines in the file, including 9-filled padding lines. */
  recordCount: number;
}

export interface ValidationResult {
  findings: Finding[];
  payments: Payment[];
  /** Raw lines of the submitted file, for the line inspector. */
  lines: string[];
  stats: ValidationStats;
}
