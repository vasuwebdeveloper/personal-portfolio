import { formatUsd } from "@/lib/nacha/parse";
import type { Payment, Severity } from "@/lib/nacha/types";

const MAX_ROWS = 250;

const TRANSACTION_LABELS: Record<string, string> = {
  "22": "Checking credit",
  "23": "Checking prenote",
  "24": "Checking zero-dollar",
  "27": "Checking debit",
  "28": "Checking prenote",
  "29": "Checking zero-dollar",
  "32": "Savings credit",
  "33": "Savings prenote",
  "34": "Savings zero-dollar",
  "37": "Savings debit",
  "38": "Savings prenote",
  "39": "Savings zero-dollar",
  "42": "GL credit",
  "43": "GL prenote",
  "44": "GL zero-dollar",
  "47": "GL debit",
  "48": "GL prenote",
  "49": "GL zero-dollar",
  "52": "Loan credit",
  "53": "Loan prenote",
  "55": "Loan debit",
};

/**
 * Decoded payments, one row per entry detail record. Row status reflects the
 * worst finding on that line so a broken payment is visible at table level
 * before anyone reads the findings list.
 */
export default function NachaPaymentsTable({
  payments,
  statusByLine,
}: {
  payments: Payment[];
  /** Worst finding severity per line number; absent = clean. */
  statusByLine: Map<number, Severity>;
}) {
  const shown = payments.slice(0, MAX_ROWS);

  return (
    <div className="mt-8">
      <h3 className="meta-label">Decoded payments ({payments.length})</h3>
      <div className="mt-3 overflow-x-auto border border-rule">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">
            Payments decoded from the file's entry detail records, with the
            validation status of each line.
          </caption>
          <thead>
            <tr className="border-b border-rule bg-band/60">
              <th scope="col" className="meta-label px-3 py-2.5 font-medium">
                Line
              </th>
              <th scope="col" className="meta-label px-3 py-2.5 font-medium">
                Payee
              </th>
              <th scope="col" className="meta-label px-3 py-2.5 font-medium">
                Routing №
              </th>
              <th scope="col" className="meta-label px-3 py-2.5 font-medium">
                Type
              </th>
              <th
                scope="col"
                className="meta-label px-3 py-2.5 text-right font-medium"
              >
                Amount
              </th>
              <th scope="col" className="meta-label px-3 py-2.5 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-[0.8125rem]">
            {shown.map((payment) => {
              const status = statusByLine.get(payment.line);
              return (
                <tr
                  key={payment.line}
                  className={`border-b border-rule last:border-b-0 ${
                    status === "error" ? "bg-stamp/5" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 text-ink-muted">
                    {payment.line}
                  </td>
                  <td className="px-3 py-2.5">
                    {payment.name || (
                      <span className="text-ink-muted">(blank)</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">{payment.routing}</td>
                  <td className="px-3 py-2.5 text-ink-muted">
                    {TRANSACTION_LABELS[payment.transactionCode] ??
                      `Code ${payment.transactionCode}`}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {payment.amountValid ? (
                      formatUsd(payment.amountCents)
                    ) : (
                      <span className="text-stamp-deep">invalid</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {status === "error" ? (
                      <span className="font-medium text-stamp-deep">
                        ✗ error
                      </span>
                    ) : status === "warning" ? (
                      <span className="font-medium text-annotate">△ check</span>
                    ) : (
                      <span className="text-ink-muted">✓ ok</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {payments.length > shown.length ? (
        <p className="mt-3 font-mono text-[0.75rem] text-ink-muted">
          …and {payments.length - shown.length} more payments not shown.
        </p>
      ) : null}
    </div>
  );
}
