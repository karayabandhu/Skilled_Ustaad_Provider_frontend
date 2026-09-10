/**
 * formatCurrency - Standardized INR formatting
 * @param {number|string} amount 
 */
export const formatCurrency = (amount) => {
  const value = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

/**
 * formatDate - Standardized date formatting
 * @param {string|Date} date 
 * @param {string} type - 'short', 'medium', 'full'
 */
export const formatDate = (date, type = 'medium') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  
  if (type === 'short') {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
  
  if (type === 'full') {
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
  }

  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * getInitials - Generate initials from name
 * @param {string} name 
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
