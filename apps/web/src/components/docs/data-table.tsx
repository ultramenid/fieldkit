export function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-[12px] border border-[var(--border)]">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-left font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 text-[var(--foreground)] ${i < rows.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
