import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NoteBox from './NoteBox';

const CompanyDetail = ({ companyName, onClose, logoUrl }) => {
  const [notes, setNotes] = useState({ industry: '', business: '', recent_issues: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const encodedCompany = useMemo(() => encodeURIComponent(companyName || ''), [companyName]);

  useEffect(() => {
    if (!companyName) return;
    let isCancelled = false;
    const fetchNotes = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/notes/${encodedCompany}`);
        if (!res.ok) throw new Error('Failed to load notes.');
        const data = await res.json();
        if (!isCancelled) {
          setNotes({
            industry: data?.industry || '',
            business: data?.business || '',
            recent_issues: data?.recent_issues || '',
          });
        }
      } catch (err) {
        if (!isCancelled) setError(err?.message || 'An unknown error occurred.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchNotes();
    return () => {
      isCancelled = true;
    };
  }, [companyName, encodedCompany]);

  const saveField = useCallback(async (fieldKey, value) => {
    try {
      const res = await fetch(`/api/notes/${encodedCompany}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: fieldKey, content: value }),
      });
      if (!res.ok) throw new Error('Failed to save.');
      setNotes(prev => ({ ...prev, [fieldKey]: value }));
    } catch (err) {
      setError(err?.message || 'An error occurred while saving.');
    }
  }, [encodedCompany]);

  const deleteField = useCallback(async (fieldKey) => {
    try {
      const res = await fetch(`/api/notes/${encodedCompany}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: fieldKey }),
      });
      if (!res.ok) throw new Error('Failed to delete.');
      setNotes(prev => ({ ...prev, [fieldKey]: '' }));
    } catch (err) {
      setError(err?.message || 'An error occurred while deleting.');
    }
  }, [encodedCompany]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[90vw] md:max-w-3xl max-h-[90vh] rounded-xl bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-8 w-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border border-gray-200">
                {companyName?.[0] || '?'}
              </span>
            )}
            <span>{companyName} Notes</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-5">
            <NoteBox
              title="Industry"
              content={notes.industry}
              onSave={(val) => saveField('industry', val)}
              onDelete={() => deleteField('industry')}
            />
            <NoteBox
              title="Core Business"
              content={notes.business}
              onSave={(val) => saveField('business', val)}
              onDelete={() => deleteField('business')}
            />
            <NoteBox
              title="Recent Key Issues"
              content={notes.recent_issues}
              onSave={(val) => saveField('recent_issues', val)}
              onDelete={() => deleteField('recent_issues')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;


