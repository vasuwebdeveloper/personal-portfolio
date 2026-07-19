/**
 * Bundled sample NACHA file for the "Load sample file" button.
 *
 * Entirely fictional: Example Mfg Co pays three sample employees through
 * First Example Bank. Routing numbers are fabricated but pass (or fail) the
 * ABA check digit exactly as seeded. The file carries 2 errors and 1 warning
 * so visitors see the validator working immediately:
 *
 *   - line 4: routing number 123456789 fails the check digit test (error)
 *   - line 6: batch control credit total says $4,500.00, entries add to
 *     $4,550.00 (error)
 *   - line 5: receiver name is blank (warning)
 *
 * Regenerate with: node lib/nacha/__tests__/fixtures/generate.mjs (the
 * "sample.ach" output). Lines are stored right-trimmed and re-padded to 94
 * characters here so trailing-space-stripping editors cannot corrupt them.
 * The parser tests pin the 2-error, 1-warning shape.
 */
import { RECORD_LENGTH } from "./parse";

const RAW_LINES = [
  "101 98765432011223344552607150930A094101FIRST EXAMPLE BANK     EXAMPLE MFG CO",
  "5200EXAMPLE MFG CO                      1122334455PPDPAYROLL   JUL 15260717   1987654320000001",
  "6229876543201234567890       0000125000               ALEX SAMPLE             0987654320000001",
  "6221234567891234567890       0000210000               JORDAN SAMPLE           0987654320000002",
  "6229876543201234567890       0000120000                                       0987654320000003",
  "820000000302098765420000000000000000004500001122334455                         987654320000001",
  "9000001000001000000030209876542000000000000000000455000",
  "9".repeat(RECORD_LENGTH),
  "9".repeat(RECORD_LENGTH),
  "9".repeat(RECORD_LENGTH),
];

export const SAMPLE_NACHA_FILE = RAW_LINES.map((line) =>
  line.padEnd(RECORD_LENGTH, " "),
).join("\n");

export const SAMPLE_FILE_NAME = "sample-payroll.ach";
