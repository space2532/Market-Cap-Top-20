import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default function handler(req, res) {
  const { year } = req.query;

  if (!year || !/^\d{4}$/.test(year)) {
    return res.status(400).json({ 
      error: 'Invalid year parameter. Please provide a valid 4-digit year.' 
    });
  }

  const availableYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  if (!availableYears.includes(year)) {
    return res.status(404).json({ 
      error: `Data for year ${year} not found. Available years: ${availableYears.join(', ')}` 
    });
  }

  const csvFilePath = path.join(process.cwd(), 'public', 'data', `market_cap_${year}.csv`);

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ 
      error: `CSV file for year ${year} not found.` 
    });
  }

  const results = [];
  const headers = ['rank', 'company_name', 'market_cap_usd', 'market_cap_display', 'logo_url', 'primary_hex'];

  try {
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        headers: headers,
        skipLines: 1 
      }))
      .on('data', (data) => {
        if (data.market_cap_usd) {
          const cleanedValue = String(data.market_cap_usd).replace(/[^0-9.E+\-]/g, '');
          data.market_cap_usd = parseFloat(cleanedValue);
          if (isNaN(data.market_cap_usd)) {
            data.market_cap_usd = 0;
          }
        } else {
          data.market_cap_usd = 0;
        }

        if (data.rank) {
          data.rank = parseInt(data.rank, 10);
        } else {
          data.rank = 0;
        }

        results.push(data);
      })
      .on('end', () => {
        results.sort((a, b) => b.market_cap_usd - a.market_cap_usd);
        
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({
          year: year,
          totalCompanies: results.length,
          data: results
        });
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Error reading CSV file' });
      });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ error: 'Error processing CSV file' });
  }
}