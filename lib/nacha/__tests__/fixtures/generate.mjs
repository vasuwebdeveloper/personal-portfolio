/**
 * Regenerates the .ach fixture files in this directory (and prints the
 * bundled sample file) from a known-good base file plus one targeted
 * mutation per finding code.
 *
 *   node lib/nacha/__tests__/fixtures/generate.mjs
 *
 * The manifest in parse.test.ts lists which finding each fixture must
 * produce; the test suite is the check that these mutations still hit the
 * codes they claim to.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const padRight = (s, n) => String(s).slice(0, n).padEnd(n, " ");
const padNum = (v, n) => String(v).slice(-n).padStart(n, "0");

// ---- record builders (positions per the Nacha spec, 1-based) ------------
function fileHeader({
  dest = " 987654320",
  origin = "1122334455",
  date = "260715",
  time = "0930",
  idMod = "A",
  destName = "FIRST EXAMPLE BANK",
  originName = "EXAMPLE MFG CO",
} = {}) {
  return (
    "1" + "01" + padRight(dest, 10) + padRight(origin, 10) + date + time +
    idMod + "094" + "10" + "1" + padRight(destName, 23) +
    padRight(originName, 23) + padRight("", 8)
  );
}

function batchHeader({
  scc = "200",
  companyName = "EXAMPLE MFG CO",
  companyId = "1122334455",
  sec = "PPD",
  entryDesc = "PAYROLL",
  descDate = "JUL 15",
  effDate = "260717",
  odfi = "98765432",
  batchNo = 1,
} = {}) {
  return (
    "5" + scc + padRight(companyName, 16) + padRight("", 20) +
    padRight(companyId, 10) + sec + padRight(entryDesc, 10) +
    padRight(descDate, 6) + effDate + "   " + "1" + odfi + padNum(batchNo, 7)
  );
}

function entry({
  txn = "22",
  routing = "987654320",
  account = "1234567890",
  amount = 0,
  idNum = "",
  name = "",
  addenda = "0",
  trace = "987654320000001",
} = {}) {
  return (
    "6" + txn + routing + padRight(account, 17) + padNum(amount, 10) +
    padRight(idNum, 15) + padRight(name, 22) + padRight("", 2) + addenda + trace
  );
}

function addendaRecord({ info = "INV 20260701 EXAMPLE", seq = 1, entrySeq = 1 } = {}) {
  return "7" + "05" + padRight(info, 80) + padNum(seq, 4) + padNum(entrySeq, 7);
}

function batchControl({
  scc = "200",
  count,
  hash,
  debit = 0,
  credit = 0,
  companyId = "1122334455",
  odfi = "98765432",
  batchNo = 1,
}) {
  return (
    "8" + scc + padNum(count, 6) + padNum(hash, 10) + padNum(debit, 12) +
    padNum(credit, 12) + padRight(companyId, 10) + padRight("", 19) +
    padRight("", 6) + odfi + padNum(batchNo, 7)
  );
}

function fileControl({ batches = 1, blocks, count, hash, debit = 0, credit = 0 }) {
  return (
    "9" + padNum(batches, 6) + padNum(blocks, 6) + padNum(count, 8) +
    padNum(hash, 10) + padNum(debit, 12) + padNum(credit, 12) +
    padRight("", 39)
  );
}

const truncHash = (sum) => sum % 10_000_000_000;
const first8 = (routing) => Number(routing.slice(0, 8));

/**
 * Assembles a complete padded file from batches of entries, computing every
 * control value, then applies `mutate(lines)` for the targeted defect.
 */
function buildFile({ batches, pad = true, mutate = null }) {
  const lines = [fileHeader()];
  let fileHash = 0;
  let fileCount = 0;
  let fileDebit = 0;
  let fileCredit = 0;

  batches.forEach((b, i) => {
    const batchNo = i + 1;
    lines.push(batchHeader({ ...b.header, batchNo }));
    let hash = 0;
    let count = 0;
    let debit = 0;
    let credit = 0;
    for (const e of b.entries) {
      lines.push(entry(e.fields));
      count += 1;
      hash += first8(e.fields.routing ?? "987654320");
      if (e.direction === "debit") debit += e.fields.amount ?? 0;
      else credit += e.fields.amount ?? 0;
      for (const a of e.addenda ?? []) {
        lines.push(addendaRecord(a));
        count += 1;
      }
    }
    lines.push(
      batchControl({
        scc: b.header?.scc ?? "200",
        companyId: b.header?.companyId ?? "1122334455",
        count, hash: truncHash(hash), debit, credit, batchNo,
      }),
    );
    fileHash += truncHash(hash);
    fileCount += count;
    fileDebit += debit;
    fileCredit += credit;
  });

  const records = lines.length + 1; // + the file control record
  lines.push(
    fileControl({
      batches: batches.length,
      blocks: Math.ceil(records / 10),
      count: fileCount,
      hash: truncHash(fileHash),
      debit: fileDebit,
      credit: fileCredit,
    }),
  );

  if (pad) {
    while (lines.length % 10 !== 0) lines.push("9".repeat(94));
  }
  if (mutate) mutate(lines);

  for (const [i, line] of lines.entries()) {
    if (line.length !== 94) {
      // Deliberate only for the line-length fixture; everything else is a bug here.
      if (!line.__allowShort) {
        console.warn(`  note: line ${i + 1} is ${line.length} chars`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

/** Overwrite 1-based inclusive positions [start, end] on a line. */
function setField(lines, lineIdx, start, end, value) {
  const width = end - start + 1;
  const line = lines[lineIdx];
  lines[lineIdx] =
    line.slice(0, start - 1) + padRight(value, width) + line.slice(end);
}

// ---- the known-good base: one PPD credit batch, three payments ----------
const baseBatches = [
  {
    header: {},
    entries: [
      { direction: "credit", fields: { routing: "987654320", amount: 125000, name: "ALEX SAMPLE", trace: "987654320000001" } },
      { direction: "credit", fields: { routing: "123456780", amount: 210000, name: "JORDAN SAMPLE", trace: "987654320000002" } },
      { direction: "credit", fields: { routing: "987654320", amount: 120000, name: "RIVER SAMPLE", trace: "987654320000003" } },
    ],
  },
];

const debitBatches = [
  {
    header: { scc: "225", sec: "CCD", entryDesc: "VENDOR PMT" },
    entries: [
      { direction: "debit", fields: { txn: "27", routing: "987654320", amount: 84500, name: "SAMPLE SUPPLY CO", trace: "987654320000001" } },
      { direction: "debit", fields: { txn: "27", routing: "123456780", amount: 61250, name: "DEMO PARTS LLC", trace: "987654320000002" } },
    ],
  },
];

const addendaBatches = [
  {
    header: { sec: "WEB", entryDesc: "PAYMENT" },
    entries: [
      {
        direction: "credit",
        fields: { routing: "987654320", amount: 50000, name: "ALEX SAMPLE", addenda: "1", trace: "987654320000001" },
        addenda: [{ info: "PAYMENT REF 20260715", seq: 1, entrySeq: 1 }],
      },
    ],
  },
];

// Entry detail lines sit at index 2..4 (0-based) in the base file.
const E1 = 2, E2 = 3, E3 = 4, BH = 1, BC = 5, FC = 6;

const fixtures = {
  "valid.ach": { batches: baseBatches },
  "valid-debit.ach": { batches: debitBatches },
  "valid-addenda.ach": { batches: addendaBatches },

  // structure
  "struct-line-length.ach": {
    batches: baseBatches,
    mutate: (l) => { l[E2] = l[E2].slice(0, 80); },
  },
  "struct-missing-file-header.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(0, 1); },
  },
  "struct-missing-file-control.ach": {
    batches: baseBatches, pad: false,
    mutate: (l) => { l.splice(FC, 1); },
  },
  "struct-unknown-record-type.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(1, 0, "4" + " ".repeat(93)); l.pop(); },
  },
  "struct-entry-outside-batch.ach": {
    batches: baseBatches,
    mutate: (l) => { const e = l[E1]; l.splice(E1, 1); l.splice(BH, 0, e); },
  },
  "struct-addenda-without-entry.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(E1, 0, addendaRecord({})); l.pop(); },
  },
  "struct-batch-not-closed.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(BC, 1); },
  },
  "struct-control-without-batch.ach": {
    batches: baseBatches,
    mutate: (l) => {
      l.splice(BC + 1, 0, batchControl({ count: 0, hash: 0, batchNo: 2 }));
      l.pop();
    },
  },
  "struct-record-after-file-control.ach": {
    batches: baseBatches,
    mutate: (l) => { l[FC + 1] = entry({ routing: "987654320", amount: 1000, name: "LATE SAMPLE" }); },
  },
  "struct-duplicate-file-header.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(1, 0, fileHeader()); l.pop(); },
  },
  "struct-padding-misplaced.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(FC, 0, "9".repeat(94)); l.pop(); },
  },
  "struct-blocking.ach": { batches: baseBatches, pad: false },

  // file header
  "fh-dest-missing.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 4, 13, "") },
  "fh-dest-format.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 4, 13, "ROUTENUM99") },
  "fh-origin-missing.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 14, 23, "") },
  "fh-origin-format.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 14, 23, "EXAMPLECO1") },
  "fh-file-date.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 24, 29, "261315") },
  "fh-record-size.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 35, 37, "093") },
  "fh-blocking-factor.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 38, 39, "20") },
  "fh-format-code.ach": { batches: baseBatches, mutate: (l) => setField(l, 0, 40, 40, "2") },

  // batch header
  "bh-service-class.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 2, 4, "210") },
  "bh-company-name.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 5, 20, "") },
  "bh-company-id.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 41, 50, "") },
  "bh-sec-unknown.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 51, 53, "TEL") },
  "bh-sec-invalid.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 51, 53, "P1D") },
  "bh-effective-date.ach": { batches: baseBatches, mutate: (l) => setField(l, BH, 70, 75, "260230") },

  // entry detail
  "ed-transaction-code.ach": { batches: baseBatches, mutate: (l) => setField(l, E1, 2, 3, "72") },
  "ed-routing-format.ach": { batches: baseBatches, mutate: (l) => setField(l, E2, 4, 12, "12345678A") },
  "ed-routing-check-digit.ach": { batches: baseBatches, mutate: (l) => setField(l, E2, 4, 12, "123456789") },
  "ed-amount.ach": { batches: baseBatches, mutate: (l) => setField(l, E2, 30, 39, "  2100.00 ") },
  "ed-name-missing.ach": { batches: baseBatches, mutate: (l) => setField(l, E3, 55, 76, "") },
  "ed-addenda-indicator.ach": { batches: baseBatches, mutate: (l) => setField(l, E1, 79, 79, "2") },
  "ed-addenda-missing.ach": { batches: baseBatches, mutate: (l) => setField(l, E1, 79, 79, "1") },
  "ed-addenda-unexpected.ach": {
    batches: baseBatches,
    mutate: (l) => { l.splice(E1 + 1, 0, addendaRecord({})); l.pop(); },
  },
  "ed-trace-format.ach": { batches: baseBatches, mutate: (l) => setField(l, E1, 80, 94, "TRACE-0000001  ") },

  // batch control
  "bc-entry-count.ach": { batches: baseBatches, mutate: (l) => setField(l, BC, 5, 10, "000004") },
  "bc-entry-hash.ach": { batches: baseBatches, mutate: (l) => setField(l, BC, 11, 20, "0000000042") },
  "bc-debit-total.ach": { batches: debitBatches, mutate: (l) => setField(l, 4, 21, 32, "000000140000") },
  "bc-credit-total.ach": { batches: baseBatches, mutate: (l) => setField(l, BC, 33, 44, "000000450000") },
  "bc-service-class-mismatch.ach": { batches: baseBatches, mutate: (l) => setField(l, BC, 2, 4, "220") },
  "bc-service-class-content.ach": {
    batches: [
      {
        header: { scc: "220", sec: "CCD", entryDesc: "VENDOR PMT" },
        entries: [
          { direction: "debit", fields: { txn: "27", routing: "987654320", amount: 84500, name: "SAMPLE SUPPLY CO" } },
        ],
      },
    ],
  },

  // file control
  "fc-batch-count.ach": { batches: baseBatches, mutate: (l) => setField(l, FC, 2, 7, "000002") },
  "fc-block-count.ach": { batches: baseBatches, mutate: (l) => setField(l, FC, 8, 13, "000009") },
  "fc-entry-count.ach": { batches: baseBatches, mutate: (l) => setField(l, FC, 14, 21, "00000007") },
  "fc-entry-hash.ach": { batches: baseBatches, mutate: (l) => setField(l, FC, 22, 31, "0000000042") },
  "fc-debit-total.ach": { batches: debitBatches, mutate: (l) => setField(l, 5, 32, 43, "000000000042") },
  "fc-credit-total.ach": { batches: baseBatches, mutate: (l) => setField(l, FC, 44, 55, "000000450000") },
};

mkdirSync(HERE, { recursive: true });
for (const [name, spec] of Object.entries(fixtures)) {
  writeFileSync(path.join(HERE, name), buildFile(spec));
  console.log(`wrote ${name}`);
}
writeFileSync(path.join(HERE, "struct-empty.ach"), "");
console.log("wrote struct-empty.ach");

// ---- the bundled sample: 2 seeded errors + 1 warning --------------------
// Error 1: bad routing check digit on line 4 (JORDAN SAMPLE).
// Error 2: batch control credit total says $4,500.00; entries add to $4,550.00.
// Warning: blank receiver name on line 5.
const sample = buildFile({
  batches: baseBatches,
  mutate: (l) => {
    setField(l, E2, 4, 12, "123456789");
    setField(l, E3, 55, 76, "");
    setField(l, BC, 33, 44, "000000450000");
  },
});
writeFileSync(path.join(HERE, "sample.ach"), sample);
console.log("wrote sample.ach (bundled in lib/nacha/sample.ts)");
console.log("\n----- sample.ach -----");
console.log(sample);
