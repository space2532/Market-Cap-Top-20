import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import YearSelector from '../components/YearSelector';
import MarketBarChart from '../components/MarketBarChart';
import EntryExitTable from '../components/EntryExitTable';
import CompanyDetail from '../components/CompanyDetail';

const IndexPage = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousCompanyData, setPreviousCompanyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [annualTheme, setAnnualTheme] = useState('');
  const [annualTrend, setAnnualTrend] = useState('');
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendDraft, setTrendDraft] = useState('');

  const fetchCompanyData = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/companies/${year}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanyData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching company data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousCompanyData = async (year) => {
    if (!year || year <= 2015) {
      setPreviousCompanyData([]);
      return;
    }
    try {
      const response = await fetch(`/api/companies/${year - 1}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPreviousCompanyData(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error('Error fetching previous year data:', err);
      setPreviousCompanyData([]);
    }
  };

  useEffect(() => {
    fetchCompanyData(selectedYear);
    fetchPreviousCompanyData(selectedYear);
    fetchAnnualNotes(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleCompanyClick = (companyName) => {
    if (!companyName) return;
    setSelectedCompany(companyName);
  };

  const fetchAnnualNotes = async (year) => {
    try {
      const response = await fetch(`/api/annual-notes/${year}`);
      if (!response.ok) {
        setAnnualTheme('');
        setAnnualTrend('');
        return;
      }
      const data = await response.json();
      setAnnualTheme(typeof data?.theme === 'string' ? data.theme : '');
      setAnnualTrend(typeof data?.trend === 'string' ? data.trend : '');
    } catch {
      setAnnualTheme('');
      setAnnualTrend('');
    }
  };

  const handleThemeEdit = async () => {
    const input = typeof window !== 'undefined' ? window.prompt(`${selectedYear} Theme`, annualTheme || '') : null;
    if (input === null) return; // cancelled
    const value = String(input).trim();
    try {
      const resp = await fetch(`/api/annual-notes/${selectedYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: value })
      });
      if (!resp.ok) throw new Error('Failed to save theme');
      setAnnualTheme(value);
    } catch (e) {
      // no-op UI
    }
  };

  const openTrendModal = () => {
    setTrendDraft(annualTrend || '');
    setIsTrendModalOpen(true);
  };

  const closeTrendModal = () => {
    setIsTrendModalOpen(false);
  };

  const handleTrendSave = async () => {
    const value = String(trendDraft || '').trim();
    try {
      const resp = await fetch(`/api/annual-notes/${selectedYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend: value })
      });
      if (!resp.ok) throw new Error('Failed to save trend');
      setAnnualTrend(value);
      setIsTrendModalOpen(false);
    } catch (e) {
      // no-op UI
    }
  };

  return (
    <>
      <Head>
        <title>Top 20 by Market Cap</title>
        <meta name="description" content="This is a dynamic data visualization project implemented with D3.js and Next.js." />
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Market Cap Top 20
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Select Year:
          </h2>
          <YearSelector 
            selectedYear={selectedYear} 
            onYearChange={handleYearChange} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            <span className="cursor-pointer hover:underline hover:text-gray-800 active:text-gray-900" onClick={handleThemeEdit} title="Click to enter annual theme note">Company Data for {selectedYear}</span>
            {annualTheme && String(annualTheme).trim().length > 0 ? <span>{` - ${annualTheme}`}</span> : null}
          </h2>
          
          {loading && (
            <div className="w-full py-20 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">Loading data...</p>
              </div>
            </div>
          )}
      {isTrendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeTrendModal}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{selectedYear} Trends and Paradigm</h4>
            </div>
            <div>
              <textarea
                className="w-full h-60 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={trendDraft}
                onChange={(e) => setTrendDraft(e.target.value)}
                placeholder="Summarize trends and paradigms in multiple lines."
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black ring-1 ring-inset ring-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:ring-black"
                onClick={closeTrendModal}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
                onClick={handleTrendSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
          {error && (
            <div className="w-full py-20 flex items-center justify-center bg-red-50 rounded-lg border-2 border-dashed border-red-300">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 text-lg font-medium">An error occurred while loading data</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
              </div>
            </div>
          )}
          
          {companyData && !loading && !error && (
            <div className="space-y-8">
              {/* Market Bar Chart */}
              <div className="bg-white rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 p-6 pb-0">
                  <span className="cursor-pointer hover:underline hover:text-gray-800 active:text-gray-900" onClick={openTrendModal} title="Click to enter annual trend note">Market Cap Visualization - {selectedYear}</span>
                </h3>
                <MarketBarChart 
                  data={companyData.data}
                  onCompanyClick={handleCompanyClick}
                />
              </div>

              {/* Entry / Exit Table */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <span className="cursor-pointer hover:underline hover:text-gray-800 active:text-gray-900" onClick={openTrendModal} title="Click to enter annual trend note">Entry / Exit (Top 20)</span>
                </h3>
                <EntryExitTable
                  currentYearData={Array.isArray(companyData?.data) ? companyData.data : []}
                  previousYearData={Array.isArray(previousCompanyData) ? previousCompanyData : []}
                  onCompanyClick={handleCompanyClick}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedCompany && (
        <CompanyDetail
          companyName={selectedCompany}
          logoUrl={Array.isArray(companyData?.data) ? (companyData.data.find(d => d?.company_name === selectedCompany)?.logo_url || '') : ''}
          onClose={() => setSelectedCompany(null)}
        />
      )}
      </div>
    </>
  );
};

export default IndexPage;