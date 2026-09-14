// Utility to parse markdown tables into structured data
export function parseMarkdownTable(markdown) {
  const lines = markdown.trim().split('\n');
  const tableLines = [];
  let inTable = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('|') && line.includes('|')) {
      inTable = true;
      // Skip separator lines (|---|---|)
      if (!line.match(/^\|[\s\-:]+\|/)) {
        tableLines.push(line);
      }
    } else if (inTable && line.trim() === '') {
      break; // End of table
    }
  }
  
  if (tableLines.length < 2) return null;
  
  // Parse header
  const headerLine = tableLines[0];
  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h.length > 0);
  
  // Parse rows
  const rows = [];
  for (let i = 1; i < tableLines.length; i++) {
    const rowLine = tableLines[i];
    const cells = rowLine
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    if (cells.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        const value = cells[idx];
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      });
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

