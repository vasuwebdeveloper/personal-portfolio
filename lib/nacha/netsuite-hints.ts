/**
 * "Fix in NetSuite" hints, keyed by finding code from lib/nacha/parse.ts.
 *
 * Context: NetSuite Electronic Bank Payments (EBP). The recurring theme is
 * deliberate: fix the source data (vendor bank details, company bank details,
 * the EFT template) and regenerate the file from Payment File Administration.
 * Hand-editing a generated ACH file breaks the control totals and entry hash.
 *
 * Editing rules: plain strings, no markup. A code with no hint here simply
 * renders no hint box. Adding or rewording a hint never touches parser code.
 */
export const NETSUITE_HINTS: Record<string, string> = {
  // ---- entry detail (vendor-level data) --------------------------------
  "ED-ROUTING-CHECK-DIGIT":
    "Open the vendor record, Bank Payment Details subtab, and re-enter the routing number from a fresh source (a voided check, not a typed email). Then regenerate the file from Payment File Administration. Do not correct the digit in the file itself; the totals and entry hash would still be built from the bad number.",
  "ED-ROUTING-FORMAT":
    "The vendor's routing number in NetSuite contains something other than 9 digits. Fix it on the vendor's Bank Payment Details subtab, then regenerate the file from Payment File Administration.",
  "ED-AMOUNT":
    "NetSuite writes amounts from the bill payment records, so a malformed amount field almost always means the file was edited after generation. Void the payment file and regenerate it from Payment File Administration instead of hand-editing.",
  "ED-NAME-MISSING":
    "Fill in the Account Name field on the vendor's Bank Payment Details subtab (or the vendor name itself). Electronic Bank Payments maps it to the receiver name in each entry.",
  "ED-TRANSACTION-CODE":
    "Check the account type (checking vs savings) on the vendor's Bank Payment Details subtab; the transaction code is derived from it. If the code looks hand-typed, regenerate the file from Payment File Administration.",
  "ED-TRACE-FORMAT":
    "Trace numbers are generated from your bank's routing prefix in the EFT template. Verify the company bank details on the template in Payment File Administration, then regenerate the file.",
  "ED-ADDENDA-MISSING":
    "The addenda setting comes from the EFT file template. Either disable addenda on the template or make sure the remittance information is populated, then regenerate the file from Payment File Administration.",
  "ED-ADDENDA-UNEXPECTED":
    "The template emitted addenda records while the entries say none follow. Toggle the addenda option on the EFT template so both agree, then regenerate the file.",
  "ED-ADDENDA-INDICATOR":
    "This field is written by the EFT template and should only ever be 0 or 1. Regenerate the file from Payment File Administration; if it persists, review the template's field mapping for position 79.",

  // ---- file header (company bank details) ------------------------------
  "FH-DEST-MISSING":
    "Enter your bank's routing number in the company bank details record used by the EFT template (Payment File Administration, Bank Details). It becomes the immediate destination in the file header.",
  "FH-DEST-FORMAT":
    "Re-enter your bank's 9-digit routing number in the company bank details record; most banks expect it right-aligned with a leading space in positions 4-13. Regenerate the file after saving.",
  "FH-ORIGIN-MISSING":
    "Enter the immediate origin your bank assigned (usually a 1 followed by your EIN) in the company bank details on the EFT template, then regenerate the file.",
  "FH-ORIGIN-FORMAT":
    "Confirm with your bank what they expect in the immediate origin field; it is usually 10 digits. Update the company bank details on the EFT template to match exactly.",
  "FH-FILE-DATE":
    "The file creation date is stamped at generation time, so an invalid date means the file was edited afterward. Regenerate the file from Payment File Administration.",
  "FH-RECORD-SIZE":
    "This constant is written by the EFT template and must be 094. Regenerate the file; if the value is still wrong, the template's file header mapping was customized and needs review.",
  "FH-BLOCKING-FACTOR":
    "This constant is written by the EFT template and must be 10. Regenerate the file; if it persists, review the template's file header mapping.",
  "FH-FORMAT-CODE":
    "This constant is written by the EFT template and must be 1. Regenerate the file; if it persists, review the template's file header mapping.",

  // ---- batch header (company / template settings) -----------------------
  "BH-COMPANY-NAME":
    "Set the company name on the company bank details record used by the EFT template. Banks print this on the receiver's statement, and most reject batches without it.",
  "BH-COMPANY-ID":
    "Enter the company ID exactly as your bank registered it (usually a 1 followed by your EIN) in the company bank details on the EFT template. A mismatch with the bank's records is a common rejection even when the format is fine.",
  "BH-SERVICE-CLASS":
    "The service class code comes from the EFT template. Vendor payment batches are credits, so the template normally writes 220 (or 200 for mixed). Regenerate the file; if the code is still wrong, review the template.",
  "BH-SEC-UNKNOWN":
    "NetSuite Electronic Bank Payments normally emits PPD for payments to individuals and CCD for payments to companies. If this batch pays vendors, set the SEC code on the EFT template to CCD and confirm the choice with your bank.",
  "BH-SEC-INVALID":
    "Set a valid SEC code on the EFT template (CCD for vendor payments, PPD for individuals), then regenerate the file from Payment File Administration.",
  "BH-EFFECTIVE-DATE":
    "The effective entry date comes from the payment date on the bill payments in the batch. Recreate the payment batch with a valid banking day, then regenerate the file.",

  // ---- control records (never hand-edit) --------------------------------
  "BC-ENTRY-COUNT":
    "NetSuite computes this count when it generates the file, so a mismatch means records were added or removed by hand afterward. Regenerate the file from Payment File Administration instead of editing it.",
  "BC-ENTRY-HASH":
    "The entry hash is recomputed at generation time. A mismatch means an entry's routing number was edited in the file after generation. Fix the vendor's bank details in NetSuite and regenerate the file.",
  "BC-DEBIT-TOTAL":
    "Control totals are computed from the payments at generation time. Fix the underlying bill payments in NetSuite and regenerate the file; never adjust the totals in the file by hand.",
  "BC-CREDIT-TOTAL":
    "Control totals are computed from the payments at generation time. Fix the underlying bill payments in NetSuite and regenerate the file; never adjust the totals in the file by hand.",
  "BC-SERVICE-CLASS-MISMATCH":
    "Both values come from the same EFT template, so a mismatch means the file was edited after generation. Regenerate it from Payment File Administration.",
  "BC-SERVICE-CLASS-CONTENT":
    "The template's service class code does not match what the batch actually contains. Set the template to 200 (mixed) or correct the payment batch, then regenerate the file.",
  "FC-BATCH-COUNT":
    "File control totals are computed at generation time; a mismatch means the file was truncated or merged by hand. Regenerate one complete file from Payment File Administration.",
  "FC-BLOCK-COUNT":
    "Regenerate the file from Payment File Administration. If you concatenated two generated files to save an upload, don't; each file carries its own control totals.",
  "FC-ENTRY-COUNT":
    "Regenerate the file from Payment File Administration. This count only drifts from the file's contents when lines are added or deleted by hand.",
  "FC-ENTRY-HASH":
    "Fix the vendor bank details behind any routing number findings above, then regenerate the file. The file-level hash is recomputed automatically.",
  "FC-DEBIT-TOTAL":
    "Fix the underlying payments in NetSuite and regenerate the file from Payment File Administration; the file-level totals are recomputed automatically.",
  "FC-CREDIT-TOTAL":
    "Fix the underlying payments in NetSuite and regenerate the file from Payment File Administration; the file-level totals are recomputed automatically.",

  // ---- structure --------------------------------------------------------
  "STRUCT-LINE-LENGTH":
    "The most common cause: the file was opened in an editor that trimmed trailing spaces or re-wrapped lines. Regenerate the file from Payment File Administration and upload it to the bank without opening it in an editor.",
  "STRUCT-BLOCKING":
    "If your bank requires padded blocks, enable the 9-filled padding option on the EFT file template in Electronic Bank Payments, then regenerate the file.",
  "STRUCT-MISSING-FILE-CONTROL":
    "The file is incomplete, usually a partial download or an interrupted generation. Regenerate and re-download the file from Payment File Administration.",
  "STRUCT-BATCH-NOT-CLOSED":
    "The file is truncated or was spliced together by hand. Regenerate one complete file from Payment File Administration.",
  "STRUCT-RECORD-AFTER-FILE-CONTROL":
    "This usually means two generated files were concatenated. Upload each generated file separately, or regenerate a single file that contains all the payment batches.",
  "STRUCT-DUPLICATE-FILE-HEADER":
    "This usually means two generated files were concatenated. Upload each generated file separately; each one must have exactly one file header.",
};
