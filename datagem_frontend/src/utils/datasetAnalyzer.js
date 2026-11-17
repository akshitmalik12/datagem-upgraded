/**
 * Intelligent Dataset Classifier & Executive Dashboard Profiler
 * Detects Amazon MTR, Flipkart Seller Hub, Shopify, Financial Ledger or Generic Business CSVs
 * and computes instant executive KPIs, revenue metrics, top SKUs, and recommended prompts.
 */

export function analyzeDatasetIntelligence(df, filename = 'dataset.csv') {
  if (!df || df.length === 0) return null;

  const columns = Object.keys(df[0] || {});
  const lowerCols = columns.map(c => c.toLowerCase().trim());

  // 1. Detect Channel / Domain
  let channel = 'generic';
  let channelLabel = 'General Business Dataset';
  let badgeColor = '#0ea5e9'; // sky blue

  const isAmazon = lowerCols.some(c => c.includes('amazon') || c === 'order id' || c === 'seller sku' || c.includes('item price') || c.includes('fba'));
  const isFlipkart = lowerCols.some(c => c.includes('flipkart') || c === 'fsn' || c.includes('order item id') || c.includes('marketplace fee'));
  const isShopify = lowerCols.some(c => c.includes('shopify') || c.includes('lineitem') || c.includes('discount code') || c.includes('shipping name'));

  if (isAmazon) {
    channel = 'amazon';
    channelLabel = 'Amazon Seller Central Report';
    badgeColor = '#f59e0b';
  } else if (isFlipkart) {
    channel = 'flipkart';
    channelLabel = 'Flipkart Seller Hub Report';
    badgeColor = '#0284c7';
  } else if (isShopify) {
    channel = 'shopify';
    channelLabel = 'Shopify Store Export';
    badgeColor = '#10b981';
  }

  // 2. Locate Key Financial & Quantitative Columns
  const revenueCol = columns.find(c => {
    const l = c.toLowerCase();
    return l.includes('selling price') || l.includes('item price') || l.includes('total') || l.includes('amount') || l.includes('revenue') || l.includes('price');
  });

  const feeCol = columns.find(c => {
    const l = c.toLowerCase();
    return l.includes('fee') || l.includes('commission') || l.includes('selling fee') || l.includes('charges');
  });

  const skuCol = columns.find(c => {
    const l = c.toLowerCase();
    return l === 'sku' || l === 'seller sku' || l === 'fsn' || l.includes('item') || l.includes('product') || l.includes('title');
  });

  const qtyCol = columns.find(c => {
    const l = c.toLowerCase();
    return l === 'quantity' || l === 'qty' || l.includes('units');
  });

  const statusCol = columns.find(c => {
    const l = c.toLowerCase();
    return l.includes('status');
  });

  // Helper clean currency/number
  const parseNum = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const cleanStr = String(val).replace(/₹|\$|,/g, '').trim();
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  let totalGross = 0;
  let totalFees = 0;
  let totalUnits = 0;
  let returnCount = 0;
  const skuMap = {};

  df.forEach(row => {
    const rev = revenueCol ? parseNum(row[revenueCol]) : 0;
    const fee = feeCol ? Math.abs(parseNum(row[feeCol])) : 0;
    const qty = qtyCol ? Math.max(1, parseInt(parseNum(row[qtyCol]), 10)) : 1;
    const sku = skuCol ? String(row[skuCol] || 'Unknown').trim() : 'General Item';
    const status = statusCol ? String(row[statusCol] || '').toLowerCase() : '';

    totalGross += rev;
    totalFees += fee;
    totalUnits += qty;

    if (status.includes('return') || status.includes('cancel') || status.includes('refund')) {
      returnCount++;
    }

    if (!skuMap[sku]) {
      skuMap[sku] = { sku, revenue: 0, units: 0 };
    }
    skuMap[sku].revenue += rev;
    skuMap[sku].units += qty;
  });

  const totalRows = df.length;
  const netPayout = totalGross - totalFees;
  const aov = totalRows > 0 ? (totalGross / totalRows) : 0;
  const returnRatePct = totalRows > 0 ? ((returnCount / totalRows) * 100) : 0;
  const feeTakeRatePct = totalGross > 0 ? ((totalFees / totalGross) * 100) : 0;

  // Top 4 SKUs
  const topSkus = Object.values(skuMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)
    .map(s => ({
      ...s,
      revenueFormatted: totalGross > 100000 ? `₹${(s.revenue / 1000).toFixed(1)}k` : `₹${s.revenue.toLocaleString()}`
    }));

  // Recommended Prompts based on detection
  let recommendedPrompts = [
    "What are the top 3 drivers of revenue?",
    "Show monthly sales trend in a line chart",
    "Find anomalies or price outliers"
  ];

  if (channel === 'amazon' || channel === 'flipkart') {
    recommendedPrompts = [
      `Calculate total ${channelLabel} commission & FBA fee leakage`,
      "Which SKUs have the highest return rate?",
      "Rank SKUs by net profit margin after marketplace fees"
    ];
  } else if (channel === 'shopify') {
    recommendedPrompts = [
      "Calculate repeat purchase rate & 30-day cohort retention",
      "Which discount codes burned the most margin?",
      "What is our customer acquisition return on ad spend (ROAS)?"
    ];
  }

  return {
    filename,
    channel,
    channelLabel,
    badgeColor,
    totalRows,
    totalUnits,
    totalGrossFormatted: totalGross > 1000000 
      ? `₹${(totalGross / 100000).toFixed(2)} Lakh` 
      : totalGross > 0 ? `₹${Math.round(totalGross).toLocaleString()}` : `${totalRows} records`,
    totalGrossRaw: totalGross,
    netPayoutFormatted: netPayout > 0 ? `₹${Math.round(netPayout).toLocaleString()}` : null,
    totalFeesFormatted: totalFees > 0 ? `₹${Math.round(totalFees).toLocaleString()}` : null,
    feeTakeRatePct: feeTakeRatePct > 0 ? feeTakeRatePct.toFixed(1) : null,
    aovFormatted: aov > 0 ? `₹${Math.round(aov).toLocaleString()}` : null,
    returnRatePct: returnRatePct > 0 ? returnRatePct.toFixed(1) : null,
    topSkus,
    recommendedPrompts,
    columns
  };
}
