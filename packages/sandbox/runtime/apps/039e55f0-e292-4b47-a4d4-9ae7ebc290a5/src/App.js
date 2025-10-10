import React, { useState } from 'react';
import Papa from 'papaparse';

function App() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setHeaders(Object.keys(results.data[0]));
            setData(results.data);
          }
        }
      });
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CSV Viewer</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ marginRight: '10px' }}
        />
        {data.length > 0 && (
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '5px', width: '200px' }}
          />
        )}
      </div>
      {filteredData.length > 0 && (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              {headers.map((header, i) => (
                <th key={i} style={{ 
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'left'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i}>
                {headers.map((header, j) => (
                  <td key={j} style={{ 
                    border: '1px solid #ddd',
                    padding: '8px'
                  }}>
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.length === 0 && <p>Upload a CSV file to view its contents</p>}
    </div>
  );
}

export default App;