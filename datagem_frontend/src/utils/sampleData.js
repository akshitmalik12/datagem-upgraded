export const DOMAIN_PRESETS = {
  ecom: {
    name: "E-Commerce & Retail",
    badge: "Amazon FBA & D2C",
    icon: "🛒",
    datasetName: "amazon_in_settlement_ledger.csv",
    description: "Amazon FBA Settlement & Returns Ledger (Oct-Nov 2026)",
    prompts: [
      "Find all weight-handling overcharges and calculate reclaimable clawbacks",
      "Which SKUs are 'Hidden Bleeders' with negative net contribution margin (CM3)?",
      "Plot daily GMV vs Return Freight losses across categories",
      "Simulate a +5% price increase on SKU ELEC-W-EARBUDS vs projected demand"
    ],
    data: [
      { order_id: "OD-4081-1", date: "2026-10-01", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, fba_fee: 142.0, return_freight: 0.0, net_profit: 1507.0, status: "Delivered" },
      { order_id: "OD-4081-2", date: "2026-10-01", sku: "FAST-CHARGER-65W", product_name: "GaN Fast Charger 65W", category: "Mobile Accessories", billed_weight_kg: 0.45, actual_weight_kg: 0.42, gross_sales: 1899.0, cogs: 520.0, fba_fee: 64.0, return_freight: 0.0, net_profit: 1315.0, status: "Delivered" },
      { order_id: "OD-4081-3", date: "2026-10-02", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, fba_fee: 142.0, return_freight: 284.0, net_profit: -426.0, status: "Customer Return" },
      { order_id: "OD-4081-4", date: "2026-10-03", sku: "MAG-POWERBANK-10K", product_name: "MagSafe PowerBank 10k", category: "Mobile Accessories", billed_weight_kg: 0.65, actual_weight_kg: 0.60, gross_sales: 3299.0, cogs: 1400.0, fba_fee: 86.0, return_freight: 0.0, net_profit: 1813.0, status: "Delivered" },
      { order_id: "OD-4081-5", date: "2026-10-04", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, fba_fee: 142.0, return_freight: 0.0, net_profit: 1507.0, status: "Delivered" },
      { order_id: "OD-4081-6", date: "2026-10-05", sku: "FAST-CHARGER-65W", product_name: "GaN Fast Charger 65W", category: "Mobile Accessories", billed_weight_kg: 0.45, actual_weight_kg: 0.42, gross_sales: 1899.0, cogs: 520.0, fba_fee: 64.0, return_freight: 0.0, net_profit: 1315.0, status: "Delivered" },
      { order_id: "OD-4081-7", date: "2026-10-06", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, fba_fee: 142.0, return_freight: 284.0, net_profit: -426.0, status: "Customer Return" },
      { order_id: "OD-4081-8", date: "2026-10-07", sku: "MAG-POWERBANK-10K", product_name: "MagSafe PowerBank 10k", category: "Mobile Accessories", billed_weight_kg: 0.65, actual_weight_kg: 0.60, gross_sales: 3299.0, cogs: 1400.0, fba_fee: 86.0, return_freight: 0.0, net_profit: 1813.0, status: "Delivered" }
    ]
  },

  saas: {
    name: "B2B SaaS & Growth",
    badge: "Stripe & Churn Metrics",
    icon: "📈",
    datasetName: "stripe_saas_metrics.csv",
    description: "Subscription Churn, Expansion ARR & Customer Cohorts",
    prompts: [
      "Calculate Monthly Recurring Revenue (MRR) and Net Dollar Retention (NDR)",
      "Which customer subscription tier has the highest churn rate?",
      "Plot cohort retention over the last 6 billing cycles",
      "Find customers with high usage but approaching contract renewal"
    ],
    data: [
      { customer_id: "CUST-901", signup_date: "2026-05-12", plan: "Enterprise", mrr: 1200.0, seats: 24, status: "Active", ltv: 14400.0, churn_risk: "Low" },
      { customer_id: "CUST-902", signup_date: "2026-06-01", plan: "Pro", mrr: 199.0, seats: 5, status: "Active", ltv: 1194.0, churn_risk: "Medium" },
      { customer_id: "CUST-903", signup_date: "2026-06-15", plan: "Starter", mrr: 49.0, seats: 1, status: "Churned", ltv: 98.0, churn_risk: "High" },
      { customer_id: "CUST-904", signup_date: "2026-07-20", plan: "Enterprise", mrr: 2400.0, seats: 50, status: "Active", ltv: 28800.0, churn_risk: "Low" },
      { customer_id: "CUST-905", signup_date: "2026-08-05", plan: "Pro", mrr: 299.0, seats: 8, status: "Active", ltv: 2392.0, churn_risk: "Low" },
      { customer_id: "CUST-906", signup_date: "2026-08-22", plan: "Starter", mrr: 49.0, seats: 1, status: "Active", ltv: 147.0, churn_risk: "Medium" },
      { customer_id: "CUST-907", signup_date: "2026-09-10", plan: "Enterprise", mrr: 1800.0, seats: 35, status: "Active", ltv: 21600.0, churn_risk: "Low" },
      { customer_id: "CUST-908", signup_date: "2026-09-28", plan: "Pro", mrr: 199.0, seats: 4, status: "Churned", ltv: 398.0, churn_risk: "High" }
    ]
  },

  studio: {
    name: "Universal Ad-Hoc Studio",
    badge: "Vectorized DuckDB",
    icon: "⚡",
    datasetName: "global_demographics_sample.csv",
    description: "Multivariate Statistical Ledger (Zero-Token OLAP)",
    prompts: [
      "Generate executive descriptive statistics and quartile distribution",
      "Plot correlation heatmap between numeric dimensions",
      "Detect statistical outliers beyond 2 standard deviations",
      "Group aggregates by region and compute median values"
    ],
    data: [
      { record_id: "REC-101", region: "North America", gdp_per_capita: 68000, tech_adoption_index: 88.5, population_millions: 375, urban_pct: 82.0 },
      { record_id: "REC-102", region: "Europe", gdp_per_capita: 46000, tech_adoption_index: 82.1, population_millions: 448, urban_pct: 75.0 },
      { record_id: "REC-103", region: "Asia Pacific", gdp_per_capita: 24000, tech_adoption_index: 79.4, population_millions: 2200, urban_pct: 54.0 },
      { record_id: "REC-104", region: "Latin America", gdp_per_capita: 14500, tech_adoption_index: 64.2, population_millions: 660, urban_pct: 81.0 },
      { record_id: "REC-105", region: "Middle East", gdp_per_capita: 31000, tech_adoption_index: 71.8, population_millions: 280, urban_pct: 70.0 },
      { record_id: "REC-106", region: "Africa", gdp_per_capita: 6200, tech_adoption_index: 48.0, population_millions: 1400, urban_pct: 44.0 }
    ]
  }
};

export const SAMPLE_ECOMMERCE_DATA = DOMAIN_PRESETS.ecom.data;
export const SAMPLE_PROMPTS = DOMAIN_PRESETS.ecom.prompts;
