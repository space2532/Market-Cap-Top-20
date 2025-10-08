import React, { useMemo } from 'react';

// currentYearData, previousYearData: arrays of objects with at least
// { company_name: string, rank: number }
const EntryExitTable = ({ currentYearData = [], previousYearData = [], onCompanyClick }) => {
  if (!previousYearData || previousYearData.length === 0) {
    return null;
  }
  const { entriesTop20, exitsTop20 } = useMemo(() => {
    if (!Array.isArray(currentYearData) || !Array.isArray(previousYearData)) {
      return { entriesTop20: [], exitsTop20: [] };
    }

    const normalizeName = (name) => (name || '').trim();

    const currentByName = new Map();
    const previousByName = new Map();

    for (const item of currentYearData) {
      const key = normalizeName(item?.company_name);
      if (key && !currentByName.has(key)) currentByName.set(key, item);
    }

    for (const item of previousYearData) {
      const key = normalizeName(item?.company_name);
      if (key && !previousByName.has(key)) previousByName.set(key, item);
    }

    const entries = [];
    for (const [name, item] of currentByName.entries()) {
      if (!previousByName.has(name)) entries.push(item);
    }

    const exits = [];
    for (const [name, item] of previousByName.entries()) {
      if (!currentByName.has(name)) exits.push(item);
    }

    const safeRank = (n) => (Number.isFinite(n) ? n : Number.POSITIVE_INFINITY);

    const entriesSorted = entries
      .slice()
      .sort((a, b) => safeRank(a?.rank) - safeRank(b?.rank))
      .slice(0, 20);

    const exitsSorted = exits
      .slice()
      .sort((a, b) => safeRank(a?.rank) - safeRank(b?.rank))
      .slice(0, 20);

    return { entriesTop20: entriesSorted, exitsTop20: exitsSorted };
  }, [currentYearData, previousYearData]);

  const CompanyCell = ({ logoUrl, name }) => (
    <div
      className={`flex items-center gap-3 ${onCompanyClick ? 'cursor-pointer' : ''}`}
      onClick={() => typeof onCompanyClick === 'function' && onCompanyClick(name)}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border border-gray-200">
          {name?.[0] || '?'}
        </div>
      )}
      <span className="text-sm text-gray-800 font-medium">{name || '-'}</span>
    </div>
  );

  return (
    <div className="w-full">
      {/* ↓↓↓ 이 div가 두 개의 테이블을 가로로 나란히 배치하는 역할을 합니다. ↓↓↓ */}
      <div className="flex flex-row gap-6">
        {/* Left: 신규 진입 (w-1/2 클래스로 너비의 절반을 차지) */}
        <div className="w-1/2 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800">Top 20 신규 진입</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">NEW RANK</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entriesTop20.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-sm text-gray-500 text-center">데이터가 없습니다</td>
                  </tr>
                )}
                {entriesTop20.map((row) => (
                  <tr key={`entry-${row.company_name}-${row.rank}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{row?.rank ?? '-'}</td>
                    <td className="px-4 py-2">
                      <CompanyCell logoUrl={row?.logo_url} name={row?.company_name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: 순위 탈락 (w-1/2 클래스로 너비의 절반을 차지) */}
        <div className="w-1/2 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800">Top 20 순위 탈락</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Prev Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exitsTop20.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-sm text-gray-500 text-center">데이터가 없습니다</td>
                  </tr>
                )}
                {exitsTop20.map((row) => (
                  <tr key={`exit-${row.company_name}-${row.rank}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{row?.rank ?? '-'}</td>
                    <td className="px-4 py-2">
                      <CompanyCell logoUrl={row?.logo_url} name={row?.company_name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryExitTable;