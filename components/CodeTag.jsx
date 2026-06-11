// Renders a mock identifier (USR-…, EVT-…, RPT-…, etc.) with a tooltip
// explaining what the code refers to. Uses the native title attribute so
// the tooltip is never clipped by table/modal overflow containers.
function CodeTag({ code, className = '' }) {
  if (!code) return null;
  const desc = describeCode(code);
  return (
    <span
      title={desc ? `${code} — ${desc}` : code}
      className={`font-mono underline decoration-dotted decoration-gray-600 underline-offset-2 cursor-help ${className}`}
    >
      {code}
    </span>
  );
}
