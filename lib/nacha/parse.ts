/**
 * NACHA (ACH) file parser and validator.
 *
 * Parses fixed-width 94-character records (types 1/5/6/7/8/9) and emits
 * findings with stable codes, so the UI and the NetSuite hint layer can key
 * off them. Pure TypeScript with no dependencies: runs entirely in the
 * browser. Field positions follow the Nacha operating rules and are quoted
 * 1-based inclusive, matching how the spec (and bank rejection notices)
 * describe them.
 *
 * This is a pre-flight check for the common formatting rejections, not a
 * substitute for a bank's or Nacha's own compliance validation.
 */
import type {
  Finding,
  Payment,
  Severity,
  ValidationResult,
} from "./types";

export const RECORD_LENGTH = 94;
export const BLOCKING_FACTOR = 10;
const PADDING_LINE = "9".repeat(RECORD_LENGTH);

/** Valid service class codes for a batch: mixed / credits only / debits only. */
const SERVICE_CLASS_CODES = new Set(["200", "220", "225"]);

/** SEC codes this tool decodes in depth. Others are valid but only skimmed. */
const KNOWN_SEC_CODES = new Set(["PPD", "CCD", "WEB", "CTX"]);

/** Transaction codes for live entries, prenotes, and zero-dollar entries. */
const CREDIT_CODES = new Set([
  "22", "23", "24", // checking
  "32", "33", "34", // savings
  "42", "43", "44", // general ledger
  "52", "53", // loan
]);
const DEBIT_CODES = new Set([
  "27", "28", "29", // checking
  "37", "38", "39", // savings
  "47", "48", "49", // general ledger
  "55", // loan (reversals)
]);
const PRENOTE_CODES = new Set(["23", "28", "33", "38", "43", "48", "53"]);

/**
 * ABA routing number check digit: 3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9)
 * must be a multiple of 10.
 */
export function abaCheckDigitValid(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false;
  const d = routing.split("").map(Number);
  const sum =
    3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
}

function isDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

/** Valid YYMMDD calendar date (years read as 20YY). */
function isValidYymmdd(value: string): boolean {
  if (!/^\d{6}$/.test(value)) return false;
  const year = 2000 + Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  if (month < 1 || month > 12) return false;
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ][month - 1];
  return day >= 1 && day <= daysInMonth;
}

/** Substring by the spec's 1-based inclusive character positions. */
function slice(line: string, start: number, end: number): string {
  return line.slice(start - 1, end);
}

/** Rightmost 10 digits of an entry-hash sum, as the spec truncates it. */
function truncateHash(sum: number): number {
  return sum % 10_000_000_000;
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

interface OpenBatch {
  headerLine: number;
  serviceClass: string;
  entryAddendaCount: number;
  entryHashSum: number;
  debitCents: number;
  creditCents: number;
  hasDebits: boolean;
  hasCredits: boolean;
  lastEntry: {
    line: number;
    addendaIndicator: string;
    addendaCount: number;
  } | null;
}

export function validateNachaFile(text: string): ValidationResult {
  const findings: Finding[] = [];
  const payments: Payment[] = [];

  const add = (
    code: string,
    severity: Severity,
    line: number,
    field: string,
    start: number,
    end: number,
    message: string,
  ) => {
    findings.push({ code, severity, line, field, start, end, message });
  };

  const lines = text.replace(/^﻿/, "").split(/\r\n|\r|\n/);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  if (lines.length === 0) {
    add(
      "STRUCT-EMPTY", "error", 1, "File", 1, RECORD_LENGTH,
      "The file is empty. A NACHA file needs at least a file header, one batch, and a file control record.",
    );
    return finish(findings, payments, lines, 0, 0, 0, 0);
  }

  // ---- file-level state -------------------------------------------------
  let sawFileHeader = false;
  let fileControlLine = 0; // 0 = not seen yet
  let batch: OpenBatch | null = null;
  let batchCount = 0;
  let fileEntryAddendaCount = 0;
  let fileEntryHashSum = 0;
  let fileDebitCents = 0;
  let fileCreditCents = 0;
  let nonPaddingRecords = 0;
  let paddingLines = 0;
  let badPadding = false;

  /** Deferred check: an entry that promised addenda must have received one. */
  const settleLastEntry = () => {
    const e = batch?.lastEntry;
    if (!batch || !e) return;
    if (e.addendaIndicator === "1" && e.addendaCount === 0) {
      add(
        "ED-ADDENDA-MISSING", "error", e.line, "Addenda record indicator", 79, 79,
        `This entry's addenda record indicator is 1, but no addenda (type-7) record follows it. Set the indicator to 0 or include the addenda record.`,
      );
    }
    batch.lastEntry = null;
  };

  const closeBatchAsUnbalanced = (atLine: number) => {
    const b = batch;
    if (!b) return;
    settleLastEntry();
    add(
      "STRUCT-BATCH-NOT-CLOSED", "error", b.headerLine, "Batch", 1, RECORD_LENGTH,
      `The batch that starts on line ${b.headerLine} has no batch control (type-8) record before line ${atLine}. Every batch must end with a batch control record.`,
    );
    // Roll its totals into the file so file-control math stays meaningful.
    fileEntryAddendaCount += b.entryAddendaCount;
    fileEntryHashSum += truncateHash(b.entryHashSum);
    fileDebitCents += b.debitCents;
    fileCreditCents += b.creditCents;
    batch = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];

    // Padding lines (all 9s) are legal only as block fill at the end.
    if (line === PADDING_LINE) {
      paddingLines += 1;
      if (fileControlLine === 0) badPadding = true;
      continue;
    }

    if (line.length !== RECORD_LENGTH) {
      add(
        "STRUCT-LINE-LENGTH", "error", lineNo, "Record length", 1, RECORD_LENGTH,
        `This line is ${line.length} characters long. Every record in a NACHA file must be exactly 94 characters, space-padded to the right.`,
      );
    }

    const type = line[0] ?? "";
    nonPaddingRecords += 1;

    if (fileControlLine !== 0) {
      add(
        "STRUCT-RECORD-AFTER-FILE-CONTROL", "error", lineNo, "Record type", 1, 1,
        `A type-${type || "?"} record appears after the file control (type-9) record on line ${fileControlLine}. Only 9-filled padding lines may follow the file control record.`,
      );
      continue;
    }

    const fullLength = line.length === RECORD_LENGTH;

    switch (type) {
      case "1": {
        if (sawFileHeader) {
          add(
            "STRUCT-DUPLICATE-FILE-HEADER", "error", lineNo, "Record type", 1, 1,
            `A second file header (type-1) record appears on line ${lineNo}. A NACHA file has exactly one file header, on line 1.`,
          );
          break;
        }
        sawFileHeader = true;
        if (lineNo !== 1) {
          add(
            "STRUCT-MISSING-FILE-HEADER", "error", 1, "Record type", 1, 1,
            `The file must begin with a file header (type-1) record on line 1; the file header was found on line ${lineNo} instead.`,
          );
        }
        if (fullLength) checkFileHeader(line, lineNo, add);
        break;
      }

      case "5": {
        if (batch) closeBatchAsUnbalanced(lineNo);
        batchCount += 1;
        const serviceClass = slice(line, 2, 4);
        batch = {
          headerLine: lineNo,
          serviceClass,
          entryAddendaCount: 0,
          entryHashSum: 0,
          debitCents: 0,
          creditCents: 0,
          hasDebits: false,
          hasCredits: false,
          lastEntry: null,
        };
        if (fullLength) checkBatchHeader(line, lineNo, add);
        break;
      }

      case "6": {
        if (!batch) {
          add(
            "STRUCT-ENTRY-OUTSIDE-BATCH", "error", lineNo, "Record type", 1, 1,
            `An entry detail (type-6) record appears outside a batch. Entries must sit between a batch header (type-5) and a batch control (type-8) record.`,
          );
        } else {
          settleLastEntry();
        }
        if (!fullLength) break;

        const entry = checkEntryDetail(line, lineNo, add);
        payments.push(entry.payment);

        if (batch) {
          batch.entryAddendaCount += 1;
          if (entry.routingFirst8 !== null) {
            batch.entryHashSum += entry.routingFirst8;
          }
          if (entry.payment.direction === "debit") {
            batch.debitCents += entry.payment.amountCents;
            batch.hasDebits = true;
          } else if (entry.payment.direction === "credit") {
            batch.creditCents += entry.payment.amountCents;
            batch.hasCredits = true;
          }
          batch.lastEntry = {
            line: lineNo,
            addendaIndicator: entry.addendaIndicator,
            addendaCount: 0,
          };
        }
        break;
      }

      case "7": {
        const entry = batch?.lastEntry;
        if (!batch || !entry) {
          add(
            "STRUCT-ADDENDA-WITHOUT-ENTRY", "error", lineNo, "Record type", 1, 1,
            `An addenda (type-7) record appears with no entry detail (type-6) record directly before it. Addenda records belong to the entry they follow.`,
          );
          break;
        }
        batch.entryAddendaCount += 1;
        entry.addendaCount += 1;
        if (entry.addendaIndicator === "0") {
          add(
            "ED-ADDENDA-UNEXPECTED", "error", entry.line, "Addenda record indicator", 79, 79,
            `The entry on line ${entry.line} has addenda record indicator 0, but an addenda record follows it on line ${lineNo}. Set the indicator to 1 or remove the addenda record.`,
          );
          // Flag once per entry, not once per addenda line.
          entry.addendaIndicator = "1";
        }
        break;
      }

      case "8": {
        const b = batch;
        if (!b) {
          add(
            "STRUCT-CONTROL-WITHOUT-BATCH", "error", lineNo, "Record type", 1, 1,
            `A batch control (type-8) record appears with no open batch. Each batch control must close a batch that began with a batch header (type-5) record.`,
          );
          break;
        }
        settleLastEntry();
        if (fullLength) checkBatchControl(line, lineNo, b, add);
        fileEntryAddendaCount += b.entryAddendaCount;
        fileEntryHashSum += truncateHash(b.entryHashSum);
        fileDebitCents += b.debitCents;
        fileCreditCents += b.creditCents;
        batch = null;
        break;
      }

      case "9": {
        if (batch) closeBatchAsUnbalanced(lineNo);
        fileControlLine = lineNo;
        if (fullLength) {
          checkFileControl(line, lineNo, {
            batchCount,
            entryAddendaCount: fileEntryAddendaCount,
            entryHashSum: fileEntryHashSum,
            debitCents: fileDebitCents,
            creditCents: fileCreditCents,
            // The file control record itself is part of the block count.
            expectedBlocks: Math.ceil((nonPaddingRecords) / BLOCKING_FACTOR),
          }, add);
        }
        break;
      }

      default: {
        add(
          "STRUCT-UNKNOWN-RECORD-TYPE", "error", lineNo, "Record type", 1, 1,
          `"${type}" is not a NACHA record type. The first character of each record must be 1 (file header), 5 (batch header), 6 (entry), 7 (addenda), 8 (batch control), or 9 (file control).`,
        );
        break;
      }
    }
  }

  // ---- end-of-file checks ----------------------------------------------
  if (batch !== null) closeBatchAsUnbalanced(lines.length + 1);

  if (!sawFileHeader) {
    add(
      "STRUCT-MISSING-FILE-HEADER", "error", 1, "Record type", 1, 1,
      "No file header (type-1) record found. A NACHA file must begin with a file header on line 1.",
    );
  }
  if (fileControlLine === 0) {
    add(
      "STRUCT-MISSING-FILE-CONTROL", "error", lines.length, "Record type", 1, 1,
      "No file control (type-9) record found. A NACHA file must end with a file control record that carries the file's totals.",
    );
  }
  if (badPadding) {
    add(
      "STRUCT-PADDING-MISPLACED", "error", lines.length, "Block padding", 1, RECORD_LENGTH,
      "A 9-filled padding line appears before the file control record. Padding lines belong only at the very end of the file, after the file control record.",
    );
  }
  if (lines.length % BLOCKING_FACTOR !== 0) {
    add(
      "STRUCT-BLOCKING", "warning", lines.length, "Block padding", 1, RECORD_LENGTH,
      `The file has ${lines.length} lines, which is not a multiple of 10. NACHA files use a blocking factor of 10: after the file control record, add lines of ninety-four 9s until the line count is a multiple of 10. Some banks accept unpadded files; many do not.`,
    );
  }

  // De-duplicate line-1 structure findings that can double up.
  const seen = new Set<string>();
  const deduped = findings.filter((f) => {
    const key = `${f.code}:${f.line}:${f.start}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return finish(
    deduped, payments, lines, batchCount, fileDebitCents, fileCreditCents, paddingLines,
  );
}

function finish(
  findings: Finding[],
  payments: Payment[],
  lines: string[],
  batchCount: number,
  debitCents: number,
  creditCents: number,
  _paddingLines: number,
): ValidationResult {
  // Errors first, then warnings, each in file order.
  const rank = (s: Severity) => (s === "error" ? 0 : 1);
  findings.sort(
    (a, b) => rank(a.severity) - rank(b.severity) || a.line - b.line || a.start - b.start,
  );
  return {
    findings,
    payments,
    lines,
    stats: {
      errorCount: findings.filter((f) => f.severity === "error").length,
      warningCount: findings.filter((f) => f.severity === "warning").length,
      paymentCount: payments.length,
      totalCents: debitCents + creditCents,
      creditCents,
      debitCents,
      batchCount,
      recordCount: lines.length,
    },
  };
}

type Add = (
  code: string,
  severity: Severity,
  line: number,
  field: string,
  start: number,
  end: number,
  message: string,
) => void;

// ---- record type 1: file header ----------------------------------------
function checkFileHeader(line: string, lineNo: number, add: Add): void {
  const dest = slice(line, 4, 13);
  if (isBlank(dest)) {
    add(
      "FH-DEST-MISSING", "error", lineNo, "Immediate destination", 4, 13,
      "The immediate destination (positions 4-13) is blank. It must carry your bank's routing number, usually written as a space followed by 9 digits.",
    );
  } else if (!/^\s?\d{9}$|^\d{10}$/.test(dest)) {
    add(
      "FH-DEST-FORMAT", "error", lineNo, "Immediate destination", 4, 13,
      `The immediate destination "${dest.trim()}" is not well-formed. Expected a space followed by a 9-digit routing number (or 10 digits), right-aligned in positions 4-13.`,
    );
  }

  const origin = slice(line, 14, 23);
  if (isBlank(origin)) {
    add(
      "FH-ORIGIN-MISSING", "error", lineNo, "Immediate origin", 14, 23,
      "The immediate origin (positions 14-23) is blank. It usually carries your company ID (often a 1 followed by your EIN) or the number your bank assigned.",
    );
  } else if (!/^\s?\d{9}$|^\d{10}$/.test(origin)) {
    add(
      "FH-ORIGIN-FORMAT", "warning", lineNo, "Immediate origin", 14, 23,
      `The immediate origin "${origin.trim()}" is unusual. Most banks expect 10 digits (often a 1 followed by your EIN). Check the value your bank asked for.`,
    );
  }

  const fileDate = slice(line, 24, 29);
  if (!isValidYymmdd(fileDate)) {
    add(
      "FH-FILE-DATE", "error", lineNo, "File creation date", 24, 29,
      `The file creation date "${fileDate}" is not a valid date in YYMMDD format.`,
    );
  }

  const recordSize = slice(line, 35, 37);
  if (recordSize !== "094") {
    add(
      "FH-RECORD-SIZE", "error", lineNo, "Record size", 35, 37,
      `The record size field reads "${recordSize}" but must be exactly "094": every NACHA record is 94 characters.`,
    );
  }

  const blockingFactor = slice(line, 38, 39);
  if (blockingFactor !== "10") {
    add(
      "FH-BLOCKING-FACTOR", "error", lineNo, "Blocking factor", 38, 39,
      `The blocking factor field reads "${blockingFactor}" but must be "10".`,
    );
  }

  const formatCode = slice(line, 40, 40);
  if (formatCode !== "1") {
    add(
      "FH-FORMAT-CODE", "error", lineNo, "Format code", 40, 40,
      `The format code reads "${formatCode}" but must be "1".`,
    );
  }
}

// ---- record type 5: batch header ---------------------------------------
function checkBatchHeader(line: string, lineNo: number, add: Add): void {
  const serviceClass = slice(line, 2, 4);
  if (!SERVICE_CLASS_CODES.has(serviceClass)) {
    add(
      "BH-SERVICE-CLASS", "error", lineNo, "Service class code", 2, 4,
      `"${serviceClass}" is not a valid service class code. Use 200 (mixed debits and credits), 220 (credits only), or 225 (debits only).`,
    );
  }

  const companyName = slice(line, 5, 20);
  if (isBlank(companyName)) {
    add(
      "BH-COMPANY-NAME", "error", lineNo, "Company name", 5, 20,
      "The company name (positions 5-20) is blank. Receiving banks print this on the receiver's statement; it must identify your company.",
    );
  }

  const companyId = slice(line, 41, 50);
  if (isBlank(companyId)) {
    add(
      "BH-COMPANY-ID", "error", lineNo, "Company identification", 41, 50,
      "The company identification (positions 41-50) is blank. It must match the originator ID your bank has on file, usually a 1 followed by your EIN.",
    );
  }

  const sec = slice(line, 51, 53);
  if (!/^[A-Z]{3}$/.test(sec)) {
    add(
      "BH-SEC-INVALID", "error", lineNo, "Standard entry class code", 51, 53,
      `The standard entry class (SEC) code "${sec}" is not well-formed. It must be three capital letters, such as PPD, CCD, WEB, or CTX.`,
    );
  } else if (!KNOWN_SEC_CODES.has(sec)) {
    add(
      "BH-SEC-UNKNOWN", "warning", lineNo, "Standard entry class code", 51, 53,
      `SEC code "${sec}" exists in the NACHA rules, but this tool only checks PPD, CCD, WEB, and CTX in depth. Confirm your bank supports ${sec} for this account.`,
    );
  }

  const effectiveDate = slice(line, 70, 75);
  if (!isValidYymmdd(effectiveDate)) {
    add(
      "BH-EFFECTIVE-DATE", "error", lineNo, "Effective entry date", 70, 75,
      `The effective entry date "${effectiveDate}" is not a valid date in YYMMDD format. This is the settlement date you are requesting for the batch.`,
    );
  }
}

// ---- record type 6: entry detail ---------------------------------------
function checkEntryDetail(
  line: string,
  lineNo: number,
  add: Add,
): {
  payment: Payment;
  routingFirst8: number | null;
  addendaIndicator: string;
} {
  const transactionCode = slice(line, 2, 3);
  const isCredit = CREDIT_CODES.has(transactionCode);
  const isDebit = DEBIT_CODES.has(transactionCode);
  if (!isCredit && !isDebit) {
    add(
      "ED-TRANSACTION-CODE", "error", lineNo, "Transaction code", 2, 3,
      `"${transactionCode}" is not a valid transaction code. Common codes: 22 (checking credit), 27 (checking debit), 32 (savings credit), 37 (savings debit); 23/28/33/38 are prenotes.`,
    );
  }

  const routing = slice(line, 4, 12);
  let routingFirst8: number | null = null;
  if (!isDigits(routing)) {
    add(
      "ED-ROUTING-FORMAT", "error", lineNo, "RDFI routing number", 4, 12,
      `The receiving bank's routing number "${routing}" must be 9 digits (8-digit identifier in positions 4-11 plus a check digit in position 12).`,
    );
  } else {
    routingFirst8 = Number(routing.slice(0, 8));
    if (!abaCheckDigitValid(routing)) {
      add(
        "ED-ROUTING-CHECK-DIGIT", "error", lineNo, "RDFI routing number", 4, 12,
        `The routing number ${routing} fails the ABA check digit test (the 3-7-1 weighted sum of its digits is not a multiple of 10). One of its digits is wrong.`,
      );
    }
  }

  const amountField = slice(line, 30, 39);
  const amountValid = isDigits(amountField);
  if (!amountValid) {
    add(
      "ED-AMOUNT", "error", lineNo, "Amount", 30, 39,
      `The amount field "${amountField}" must be 10 digits (cents, right-aligned, zero-filled). For example, $125.00 is written 0000012500.`,
    );
  }
  const amountCents = amountValid ? Number(amountField) : 0;

  const name = slice(line, 55, 76);
  if (isBlank(name)) {
    add(
      "ED-NAME-MISSING", "warning", lineNo, "Individual / receiver name", 55, 76,
      "The receiver name (positions 55-76) is blank. Nacha rules require it, and many banks reject entries without it.",
    );
  }

  const addendaIndicator = slice(line, 79, 79);
  if (addendaIndicator !== "0" && addendaIndicator !== "1") {
    add(
      "ED-ADDENDA-INDICATOR", "error", lineNo, "Addenda record indicator", 79, 79,
      `The addenda record indicator reads "${addendaIndicator}" but must be 0 (no addenda) or 1 (an addenda record follows).`,
    );
  }

  const traceNumber = slice(line, 80, 94);
  if (!isDigits(traceNumber)) {
    add(
      "ED-TRACE-FORMAT", "error", lineNo, "Trace number", 80, 94,
      `The trace number "${traceNumber}" must be 15 digits: your bank's 8-digit routing prefix followed by a 7-digit sequence number.`,
    );
  }

  // Direction by the code's last digit so a mistyped first digit still
  // lands the amount in the right column instead of cascading total errors.
  const lastDigit = transactionCode[1] ?? "";
  const direction: Payment["direction"] =
    isCredit || "234".includes(lastDigit)
      ? "credit"
      : isDebit || "789".includes(lastDigit)
        ? "debit"
        : "unknown";

  return {
    payment: {
      line: lineNo,
      name: name.trim(),
      amountCents,
      amountValid,
      routing,
      transactionCode,
      direction,
      prenote: PRENOTE_CODES.has(transactionCode),
      traceNumber,
    },
    routingFirst8,
    addendaIndicator,
  };
}

// ---- record type 8: batch control --------------------------------------
function checkBatchControl(
  line: string,
  lineNo: number,
  batch: OpenBatch,
  add: Add,
): void {
  const serviceClass = slice(line, 2, 4);
  if (serviceClass !== batch.serviceClass) {
    add(
      "BC-SERVICE-CLASS-MISMATCH", "error", lineNo, "Service class code", 2, 4,
      `The batch control's service class code (${serviceClass}) does not match the batch header's (${batch.serviceClass}) on line ${batch.headerLine}. They must be identical.`,
    );
  }
  if (batch.serviceClass === "220" && batch.hasDebits) {
    add(
      "BC-SERVICE-CLASS-CONTENT", "error", lineNo, "Service class code", 2, 4,
      `This batch is marked 220 (credits only) but contains debit entries. Use 200 (mixed) or remove the debits.`,
    );
  } else if (batch.serviceClass === "225" && batch.hasCredits) {
    add(
      "BC-SERVICE-CLASS-CONTENT", "error", lineNo, "Service class code", 2, 4,
      `This batch is marked 225 (debits only) but contains credit entries. Use 200 (mixed) or remove the credits.`,
    );
  }

  const countField = slice(line, 5, 10);
  if (!isDigits(countField) || Number(countField) !== batch.entryAddendaCount) {
    add(
      "BC-ENTRY-COUNT", "error", lineNo, "Entry / addenda count", 5, 10,
      `The batch control says ${countField.trim() || "(blank)"} entry and addenda records, but the batch contains ${batch.entryAddendaCount}.`,
    );
  }

  const hashField = slice(line, 11, 20);
  const expectedHash = truncateHash(batch.entryHashSum);
  if (!isDigits(hashField) || Number(hashField) !== expectedHash) {
    add(
      "BC-ENTRY-HASH", "error", lineNo, "Entry hash", 11, 20,
      `The batch control's entry hash reads ${hashField.trim() || "(blank)"}, but the sum of the first 8 digits of each entry's routing number is ${String(expectedHash).padStart(10, "0")}. Banks use this as a quick integrity check.`,
    );
  }

  const debitField = slice(line, 21, 32);
  if (!isDigits(debitField) || Number(debitField) !== batch.debitCents) {
    add(
      "BC-DEBIT-TOTAL", "error", lineNo, "Total debit amount", 21, 32,
      `The batch control says total debits of ${isDigits(debitField) ? formatUsd(Number(debitField)) : `"${debitField}"`}, but the debit entries in this batch add up to ${formatUsd(batch.debitCents)}.`,
    );
  }

  const creditField = slice(line, 33, 44);
  if (!isDigits(creditField) || Number(creditField) !== batch.creditCents) {
    add(
      "BC-CREDIT-TOTAL", "error", lineNo, "Total credit amount", 33, 44,
      `The batch control says total credits of ${isDigits(creditField) ? formatUsd(Number(creditField)) : `"${creditField}"`}, but the credit entries in this batch add up to ${formatUsd(batch.creditCents)}.`,
    );
  }
}

// ---- record type 9: file control ----------------------------------------
interface FileTotals {
  batchCount: number;
  entryAddendaCount: number;
  entryHashSum: number;
  debitCents: number;
  creditCents: number;
  expectedBlocks: number;
}

function checkFileControl(
  line: string,
  lineNo: number,
  totals: FileTotals,
  add: Add,
): void {
  const batchField = slice(line, 2, 7);
  if (!isDigits(batchField) || Number(batchField) !== totals.batchCount) {
    add(
      "FC-BATCH-COUNT", "error", lineNo, "Batch count", 2, 7,
      `The file control says ${batchField.trim() || "(blank)"} batches, but the file contains ${totals.batchCount}.`,
    );
  }

  const blockField = slice(line, 8, 13);
  if (!isDigits(blockField) || Number(blockField) !== totals.expectedBlocks) {
    add(
      "FC-BLOCK-COUNT", "error", lineNo, "Block count", 8, 13,
      `The file control says ${blockField.trim() || "(blank)"} blocks, but the file's records fill ${totals.expectedBlocks} block${totals.expectedBlocks === 1 ? "" : "s"} of 10 records each.`,
    );
  }

  const countField = slice(line, 14, 21);
  if (!isDigits(countField) || Number(countField) !== totals.entryAddendaCount) {
    add(
      "FC-ENTRY-COUNT", "error", lineNo, "Entry / addenda count", 14, 21,
      `The file control says ${countField.trim() || "(blank)"} entry and addenda records, but the file contains ${totals.entryAddendaCount}.`,
    );
  }

  const hashField = slice(line, 22, 31);
  const expectedHash = truncateHash(totals.entryHashSum);
  if (!isDigits(hashField) || Number(hashField) !== expectedHash) {
    add(
      "FC-ENTRY-HASH", "error", lineNo, "Entry hash", 22, 31,
      `The file control's entry hash reads ${hashField.trim() || "(blank)"}, but the batches' entry hashes add up to ${String(expectedHash).padStart(10, "0")}.`,
    );
  }

  const debitField = slice(line, 32, 43);
  if (!isDigits(debitField) || Number(debitField) !== totals.debitCents) {
    add(
      "FC-DEBIT-TOTAL", "error", lineNo, "Total debit amount", 32, 43,
      `The file control says total debits of ${isDigits(debitField) ? formatUsd(Number(debitField)) : `"${debitField}"`}, but the file's debit entries add up to ${formatUsd(totals.debitCents)}.`,
    );
  }

  const creditField = slice(line, 44, 55);
  if (!isDigits(creditField) || Number(creditField) !== totals.creditCents) {
    add(
      "FC-CREDIT-TOTAL", "error", lineNo, "Total credit amount", 44, 55,
      `The file control says total credits of ${isDigits(creditField) ? formatUsd(Number(creditField)) : `"${creditField}"`}, but the file's credit entries add up to ${formatUsd(totals.creditCents)}.`,
    );
  }
}
