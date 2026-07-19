import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { abaCheckDigitValid, validateNachaFile } from "../parse";
import { SAMPLE_NACHA_FILE } from "../sample";
import type { Severity } from "../types";

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

function validateFixture(name: string) {
  return validateNachaFile(readFileSync(path.join(FIXTURES, name), "utf8"));
}

describe("abaCheckDigitValid", () => {
  it("accepts routing numbers whose 3-7-1 weighted sum is a multiple of 10", () => {
    expect(abaCheckDigitValid("987654320")).toBe(true);
    expect(abaCheckDigitValid("123456780")).toBe(true);
  });

  it("rejects a wrong check digit, wrong length, and non-digits", () => {
    expect(abaCheckDigitValid("123456789")).toBe(false);
    expect(abaCheckDigitValid("98765432")).toBe(false);
    expect(abaCheckDigitValid("98765432X")).toBe(false);
  });
});

describe("valid files", () => {
  it.each(["valid.ach", "valid-debit.ach", "valid-addenda.ach"])(
    "%s produces no findings",
    (name) => {
      const result = validateFixture(name);
      expect(result.findings).toEqual([]);
      expect(result.stats.errorCount).toBe(0);
      expect(result.stats.warningCount).toBe(0);
    },
  );

  it("decodes the payments table from valid.ach", () => {
    const result = validateFixture("valid.ach");
    expect(result.payments).toHaveLength(3);
    expect(result.payments[0]).toMatchObject({
      line: 3,
      name: "ALEX SAMPLE",
      amountCents: 125000,
      amountValid: true,
      routing: "987654320",
      transactionCode: "22",
      direction: "credit",
      prenote: false,
    });
    expect(result.stats).toMatchObject({
      paymentCount: 3,
      totalCents: 455000,
      creditCents: 455000,
      debitCents: 0,
      batchCount: 1,
      recordCount: 10,
    });
  });

  it("decodes debits from valid-debit.ach", () => {
    const result = validateFixture("valid-debit.ach");
    expect(result.payments.map((p) => p.direction)).toEqual([
      "debit",
      "debit",
    ]);
    expect(result.stats.debitCents).toBe(145750);
    expect(result.stats.creditCents).toBe(0);
  });
});

/**
 * One fixture per finding code. Mutations can cascade (a broken amount also
 * breaks the batch totals), so each case asserts the expected finding is
 * present, not that it is alone.
 */
const CASES: Array<[file: string, code: string, severity: Severity]> = [
  ["struct-empty.ach", "STRUCT-EMPTY", "error"],
  ["struct-line-length.ach", "STRUCT-LINE-LENGTH", "error"],
  ["struct-missing-file-header.ach", "STRUCT-MISSING-FILE-HEADER", "error"],
  ["struct-missing-file-control.ach", "STRUCT-MISSING-FILE-CONTROL", "error"],
  ["struct-unknown-record-type.ach", "STRUCT-UNKNOWN-RECORD-TYPE", "error"],
  ["struct-entry-outside-batch.ach", "STRUCT-ENTRY-OUTSIDE-BATCH", "error"],
  ["struct-addenda-without-entry.ach", "STRUCT-ADDENDA-WITHOUT-ENTRY", "error"],
  ["struct-batch-not-closed.ach", "STRUCT-BATCH-NOT-CLOSED", "error"],
  ["struct-control-without-batch.ach", "STRUCT-CONTROL-WITHOUT-BATCH", "error"],
  [
    "struct-record-after-file-control.ach",
    "STRUCT-RECORD-AFTER-FILE-CONTROL",
    "error",
  ],
  ["struct-duplicate-file-header.ach", "STRUCT-DUPLICATE-FILE-HEADER", "error"],
  ["struct-padding-misplaced.ach", "STRUCT-PADDING-MISPLACED", "error"],
  ["struct-blocking.ach", "STRUCT-BLOCKING", "warning"],

  ["fh-dest-missing.ach", "FH-DEST-MISSING", "error"],
  ["fh-dest-format.ach", "FH-DEST-FORMAT", "error"],
  ["fh-origin-missing.ach", "FH-ORIGIN-MISSING", "error"],
  ["fh-origin-format.ach", "FH-ORIGIN-FORMAT", "warning"],
  ["fh-file-date.ach", "FH-FILE-DATE", "error"],
  ["fh-record-size.ach", "FH-RECORD-SIZE", "error"],
  ["fh-blocking-factor.ach", "FH-BLOCKING-FACTOR", "error"],
  ["fh-format-code.ach", "FH-FORMAT-CODE", "error"],

  ["bh-service-class.ach", "BH-SERVICE-CLASS", "error"],
  ["bh-company-name.ach", "BH-COMPANY-NAME", "error"],
  ["bh-company-id.ach", "BH-COMPANY-ID", "error"],
  ["bh-sec-unknown.ach", "BH-SEC-UNKNOWN", "warning"],
  ["bh-sec-invalid.ach", "BH-SEC-INVALID", "error"],
  ["bh-effective-date.ach", "BH-EFFECTIVE-DATE", "error"],

  ["ed-transaction-code.ach", "ED-TRANSACTION-CODE", "error"],
  ["ed-routing-format.ach", "ED-ROUTING-FORMAT", "error"],
  ["ed-routing-check-digit.ach", "ED-ROUTING-CHECK-DIGIT", "error"],
  ["ed-amount.ach", "ED-AMOUNT", "error"],
  ["ed-name-missing.ach", "ED-NAME-MISSING", "warning"],
  ["ed-addenda-indicator.ach", "ED-ADDENDA-INDICATOR", "error"],
  ["ed-addenda-missing.ach", "ED-ADDENDA-MISSING", "error"],
  ["ed-addenda-unexpected.ach", "ED-ADDENDA-UNEXPECTED", "error"],
  ["ed-trace-format.ach", "ED-TRACE-FORMAT", "error"],

  ["bc-entry-count.ach", "BC-ENTRY-COUNT", "error"],
  ["bc-entry-hash.ach", "BC-ENTRY-HASH", "error"],
  ["bc-debit-total.ach", "BC-DEBIT-TOTAL", "error"],
  ["bc-credit-total.ach", "BC-CREDIT-TOTAL", "error"],
  ["bc-service-class-mismatch.ach", "BC-SERVICE-CLASS-MISMATCH", "error"],
  ["bc-service-class-content.ach", "BC-SERVICE-CLASS-CONTENT", "error"],

  ["fc-batch-count.ach", "FC-BATCH-COUNT", "error"],
  ["fc-block-count.ach", "FC-BLOCK-COUNT", "error"],
  ["fc-entry-count.ach", "FC-ENTRY-COUNT", "error"],
  ["fc-entry-hash.ach", "FC-ENTRY-HASH", "error"],
  ["fc-debit-total.ach", "FC-DEBIT-TOTAL", "error"],
  ["fc-credit-total.ach", "FC-CREDIT-TOTAL", "error"],
];

describe("finding fixtures", () => {
  it.each(CASES)("%s emits %s (%s)", (file, code, severity) => {
    const result = validateFixture(file);
    const hit = result.findings.find((f) => f.code === code);
    expect(hit, `expected ${code} in ${file}`).toBeDefined();
    expect(hit?.severity).toBe(severity);
  });

  it("anchors findings to the line and character positions of the field", () => {
    const result = validateFixture("ed-routing-check-digit.ach");
    const hit = result.findings.find(
      (f) => f.code === "ED-ROUTING-CHECK-DIGIT",
    );
    expect(hit).toMatchObject({
      line: 4,
      field: "RDFI routing number",
      start: 4,
      end: 12,
    });
  });
});

describe("bundled sample file", () => {
  it("carries exactly 2 errors and 1 warning", () => {
    const result = validateNachaFile(SAMPLE_NACHA_FILE);
    expect(
      result.findings.map((f) => f.code).sort(),
    ).toEqual(["BC-CREDIT-TOTAL", "ED-NAME-MISSING", "ED-ROUTING-CHECK-DIGIT"]);
    expect(result.stats.errorCount).toBe(2);
    expect(result.stats.warningCount).toBe(1);
    expect(result.stats.paymentCount).toBe(3);
  });

  it("matches the generated fixture line for line", () => {
    // Normalize CRLF: git's eol conversion may rewrite fixtures on checkout.
    const fixture = readFileSync(path.join(FIXTURES, "sample.ach"), "utf8")
      .replace(/\r\n/g, "\n")
      .replace(/\n$/, "");
    expect(SAMPLE_NACHA_FILE).toBe(fixture);
  });
});
