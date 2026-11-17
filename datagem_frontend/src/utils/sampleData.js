export const SAMPLE_ECOMMERCE_DATA = [
  { order_id: 1001, date: "2026-10-01", customer_segment: "Returning", sku: "HydroFlask-Steel", revenue: 45.0, ad_spend: 12.0, refunds: 0 },
  { order_id: 1002, date: "2026-10-01", customer_segment: "New", sku: "EcoGrip-Mat", revenue: 78.0, ad_spend: 34.0, refunds: 0 },
  { order_id: 1003, date: "2026-10-02", customer_segment: "New", sku: "PureSilk-SleepMask", revenue: 29.0, ad_spend: 18.5, refunds: 29.0 },
  { order_id: 1004, date: "2026-10-02", customer_segment: "Returning", sku: "HydroFlask-Steel", revenue: 90.0, ad_spend: 8.0, refunds: 0 },
  { order_id: 1005, date: "2026-10-03", customer_segment: "VIP", sku: "AeroPulse-Earbuds", revenue: 149.0, ad_spend: 25.0, refunds: 0 },
  { order_id: 1006, date: "2026-10-03", customer_segment: "New", sku: "EcoGrip-Mat", revenue: 78.0, ad_spend: 38.0, refunds: 0 },
  { order_id: 1007, date: "2026-10-04", customer_segment: "Returning", sku: "AeroPulse-Earbuds", revenue: 149.0, ad_spend: 15.0, refunds: 0 },
  { order_id: 1008, date: "2026-10-04", customer_segment: "New", sku: "PureSilk-SleepMask", revenue: 29.0, ad_spend: 21.0, refunds: 0 },
  { order_id: 1009, date: "2026-10-05", customer_segment: "VIP", sku: "HydroFlask-Steel", revenue: 135.0, ad_spend: 10.0, refunds: 0 },
  { order_id: 1010, date: "2026-10-05", customer_segment: "New", sku: "EcoGrip-Mat", revenue: 78.0, ad_spend: 42.0, refunds: 78.0 }
];

export const SAMPLE_PROMPTS = [
  "Show net profit and blended ROAS by product SKU",
  "Which customer segment generates the lowest refund rate?",
  "Plot cumulative daily revenue vs total ad spend",
  "Calculate repeat purchase rate and average order value (AOV)"
];
