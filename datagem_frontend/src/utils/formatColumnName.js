/**
 * Formats column names to be more readable and concise
 * Handles various naming conventions: snake_case, camelCase, PascalCase, etc.
 */
export function formatColumnName(columnName) {
  if (!columnName) return '';
  
  // If it's already nicely formatted (has spaces), return as is
  if (columnName.includes(' ') && !columnName.includes('_')) {
    return columnName;
  }
  
  // Replace underscores and hyphens with spaces
  let formatted = columnName.replace(/[_-]/g, ' ');
  
  // Handle camelCase and PascalCase by inserting spaces before capital letters
  // But avoid splitting acronyms (e.g., "ID" should stay as "ID")
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Handle numbers (e.g., "column1" -> "column 1", but "column1Name" -> "column 1 Name")
  formatted = formatted.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  formatted = formatted.replace(/(\d)([a-zA-Z])/g, '$1 $2');
  
  // Capitalize first letter of each word
  formatted = formatted
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Don't capitalize common words unless they're the first word
      const commonWords = ['of', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
      if (commonWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  // Capitalize first letter
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  
  // Clean up multiple spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();
  
  // Truncate very long names (max 25 chars) with ellipsis
  if (formatted.length > 25) {
    formatted = formatted.substring(0, 22) + '...';
  }
  
  return formatted;
}

/**
 * Gets a short abbreviation for a column name (for tooltips or compact displays)
 */
export function getColumnAbbreviation(columnName) {
  if (!columnName) return '';
  
  // If it's short enough, return as is
  if (columnName.length <= 12) {
    return columnName;
  }
  
  // Try to create an abbreviation from capital letters
  const capitals = columnName.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2) {
    return capitals.join('');
  }
  
  // Otherwise, take first few characters
  return columnName.substring(0, 10) + '...';
}

