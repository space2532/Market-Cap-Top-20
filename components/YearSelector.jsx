import React from 'react';

const YearSelector = ({ selectedYear, onYearChange }) => {
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  return (
    <div className="flex gap-2 flex-wrap">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            selectedYear === year
              ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
};

export default YearSelector;