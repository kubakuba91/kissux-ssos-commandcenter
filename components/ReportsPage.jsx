const REPORT_STATUS_STYLES = {
  Draft: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  Filed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Acknowledged: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

function NewReportModal({ onClose, onSubmit }) {
  const { useState } = React;
  const [form, setForm] = useState({
    seniorId: genUserId(),
    summary: '',
    scamType: SCAM_TYPES[0],
    agency: 'FTC',
    transcript: '',
    notes: '',
  });

  const loss = LOSS_LOOKUP[form.scamType] || 0;

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-lg w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">New Report</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Senior ID</label>
            <input value={form.seniorId} disabled className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 font-mono text-gray-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Incident Summary</label>
            <textarea value={form.summary} onChange={e => update('summary', e.target.value)} rows={3} className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 text-gray-200" placeholder="Brief description of the incident..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Scam Classification</label>
              <select value={form.scamType} onChange={e => update('scamType', e.target.value)} className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 text-gray-200">
                {SCAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estimated Loss</label>
              <input value={`$${loss.toLocaleString()}`} disabled className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 font-mono text-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">MITRE Risk Score Breakdown</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-[#0f1117] border border-white/10 rounded px-2 py-1.5"><div className="text-gray-500">Initial Access</div><div className="text-amber-400">High</div></div>
              <div className="bg-[#0f1117] border border-white/10 rounded px-2 py-1.5"><div className="text-gray-500">Pretexting</div><div className="text-red-400">Critical</div></div>
              <div className="bg-[#0f1117] border border-white/10 rounded px-2 py-1.5"><div className="text-gray-500">Impact</div><div className="text-amber-400">High</div></div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Transcript Excerpt</label>
            <textarea value={form.transcript} onChange={e => update('transcript', e.target.value)} rows={2} className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 text-gray-400 italic" placeholder="...relevant excerpt..." />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Requesting Agency</label>
            <select value={form.agency} onChange={e => update('agency', e.target.value)} className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 text-gray-200">
              <option>FTC</option>
              <option>FBI IC3</option>
              <option>APS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Operator Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} className="w-full bg-[#0f1117] border border-white/10 rounded px-2 py-1.5 text-gray-200" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
          <button
            onClick={() => onSubmit({ id: genId('RPT'), seniorId: form.seniorId, date: Date.now(), scamType: form.scamType, loss, agency: form.agency, status: 'Draft' })}
            className="px-4 py-1.5 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-md hover:bg-blue-500/30"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { useState } = React;
  const [reports, setReports] = useState(SEED_REPORTS);
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Reports</h2>
        <button onClick={() => setShowModal(true)} className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-md hover:bg-blue-500/30">
          + New Report
        </button>
      </div>
      <div className="text-xs text-gray-500 mb-4">Filed and draft reports — agency-initiated, manual workflow.</div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(r => (
          <div key={r.id} className="bg-[#1a1d27] border border-white/10 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="font-mono text-sm text-gray-200">{r.seniorId}</div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${REPORT_STATUS_STYLES[r.status]}`}>{r.status.toUpperCase()}</span>
            </div>
            <div className="text-xs text-gray-400">{r.scamType}</div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-500">
              <div>Date: <span className="text-gray-300">{new Date(r.date).toLocaleDateString()}</span></div>
              <div>Loss: <span className="text-red-400">${r.loss.toLocaleString()}</span></div>
              <div>Agency: <span className="text-gray-300">{r.agency}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <NewReportModal
          onClose={() => setShowModal(false)}
          onSubmit={(report) => { setReports(prev => [report, ...prev]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
