"""
Central Sample Datasets for E-Commerce, B2B SaaS, and Ad-Hoc Analytics.
Used for instant demo calculations and fallback audits in DataGem.
"""

DOMAIN_PRESETS = {
    "ecom": {
        "name": "E-Commerce & Retail",
        "badge": "Amazon FBA & D2C",
        "datasetName": "amazon_in_settlement_ledger.csv",
        "data": [
            { "order_id": "OD-4081-1", "date": "2026-10-01", "sku": "ELEC-W-EARBUDS", "product_name": "Wireless ANC Earbuds", "category": "Electronics", "billed_weight_kg": 1.25, "actual_weight_kg": 0.38, "gross_sales": 2499.0, "cogs": 850.0, "platform_fees": 385.0, "return_freight": 0.0, "status": "Delivered" },
            { "order_id": "OD-4081-2", "date": "2026-10-01", "sku": "FAST-CHARGER-65W", "product_name": "GaN Fast Charger 65W", "category": "Mobile Accessories", "billed_weight_kg": 0.45, "actual_weight_kg": 0.42, "gross_sales": 1899.0, "cogs": 520.0, "platform_fees": 45.0, "return_freight": 0.0, "status": "Delivered" },
            { "order_id": "OD-4081-3", "date": "2026-10-02", "sku": "ELEC-W-EARBUDS", "product_name": "Wireless ANC Earbuds", "category": "Electronics", "billed_weight_kg": 1.25, "actual_weight_kg": 0.38, "gross_sales": 2499.0, "cogs": 850.0, "platform_fees": 385.0, "return_freight": 284.0, "status": "Customer Return" },
            { "order_id": "OD-4081-4", "date": "2026-10-03", "sku": "MAG-POWERBANK-10K", "product_name": "MagSafe PowerBank 10k", "category": "Mobile Accessories", "billed_weight_kg": 0.65, "actual_weight_kg": 0.60, "gross_sales": 3299.0, "cogs": 1400.0, "platform_fees": 490.0, "return_freight": 0.0, "status": "Delivered" },
            { "order_id": "OD-4081-5", "date": "2026-10-04", "sku": "ELEC-W-EARBUDS", "product_name": "Wireless ANC Earbuds", "category": "Electronics", "billed_weight_kg": 1.25, "actual_weight_kg": 0.38, "gross_sales": 2499.0, "cogs": 850.0, "platform_fees": 385.0, "return_freight": 0.0, "status": "Delivered" },
            { "order_id": "OD-4081-6", "date": "2026-10-05", "sku": "FAST-CHARGER-65W", "product_name": "GaN Fast Charger 65W", "category": "Mobile Accessories", "billed_weight_kg": 0.45, "actual_weight_kg": 0.42, "gross_sales": 1899.0, "cogs": 520.0, "platform_fees": 45.0, "return_freight": 0.0, "status": "Delivered" },
            { "order_id": "OD-4081-7", "date": "2026-10-06", "sku": "ELEC-W-EARBUDS", "product_name": "Wireless ANC Earbuds", "category": "Electronics", "billed_weight_kg": 1.25, "actual_weight_kg": 0.38, "gross_sales": 2499.0, "cogs": 850.0, "platform_fees": 385.0, "return_freight": 284.0, "status": "Customer Return" },
            { "order_id": "OD-4081-8", "date": "2026-10-07", "sku": "MAG-POWERBANK-10K", "product_name": "MagSafe PowerBank 10k", "category": "Mobile Accessories", "billed_weight_kg": 0.65, "actual_weight_kg": 0.60, "gross_sales": 3299.0, "cogs": 1400.0, "platform_fees": 490.0, "return_freight": 0.0, "status": "Delivered" }
        ]
    },
    "saas": {
        "name": "B2B SaaS & Growth",
        "datasetName": "stripe_saas_metrics.csv",
        "data": [
            { "customer_id": "CUST-901", "signup_date": "2026-05-12", "plan": "Enterprise", "mrr": 1200.0, "seats": 24, "status": "Active", "ltv": 14400.0, "churn_risk": "Low" },
            { "customer_id": "CUST-902", "signup_date": "2026-06-01", "plan": "Pro", "mrr": 199.0, "seats": 5, "status": "Active", "ltv": 1194.0, "churn_risk": "Medium" }
        ]
    }
}
