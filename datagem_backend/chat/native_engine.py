"""
DataGem Native Query Engine (Zero-LLM Autonomous Analytics)
Processes generic CSVs, Amazon Seller Central MTR reports, Flipkart Seller reports,
Shopify CSVs, and general business tabular data directly using DuckDB, Pandas, and Plotly.
Zero API cost, deterministic, instant response.
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
import duckdb

logger = logging.getLogger(__name__)

class NativeAnalyticsEngine:
    """
    Evaluates analytical user queries directly on in-memory tabular data.
    Detects metrics, dimensions, aggregations, e-commerce marketplace structures,
    and returns rich Markdown insights plus Plotly JSON visualizations.
    """

    def __init__(self, dataset: Optional[List[Dict[str, Any]]] = None, dataset_path: Optional[str] = None):
        self.df: Optional[pd.DataFrame] = None
        self.con = duckdb.connect(database=":memory:")
        
        if dataset and len(dataset) > 0:
            self.df = pd.DataFrame(dataset)
            self._clean_and_register()
        elif dataset_path:
            try:
                self.df = pd.read_csv(dataset_path)
                self._clean_and_register()
            except Exception as e:
                logger.error(f"Failed to read dataset from path {dataset_path}: {e}")

    def _clean_and_register(self):
        """Cleans currency strings, dates, and registers the table in DuckDB."""
        if self.df is None or self.df.empty:
            return

        # Normalize column names: strip spaces
        self.df.columns = [str(c).strip() for c in self.df.columns]

        # Auto-convert currency/percentage strings to float
        for col in self.df.columns:
            if self.df[col].dtype == object:
                sample = self.df[col].dropna().astype(str).head(20)
                is_currency = sample.str.contains(r'^[₹\$€£\s\-0-9,.]+$').all()
                if is_currency and len(sample) > 0:
                    try:
                        self.df[col] = (
                            self.df[col]
                            .astype(str)
                            .str.replace(r'[₹\$€£,\s]', '', regex=True)
                            .replace('', '0')
                            .astype(float)
                        )
                    except Exception:
                        pass

        # Register in DuckDB
        self.con.register("df", self.df)

    def is_analytical_query(self, query: str) -> bool:
        """Determines if the query can be resolved locally without an LLM."""
        if self.df is None or self.df.empty:
            return False

        q = query.lower().strip()
        
        # Core analytical intents
        keywords = [
            "top", "highest", "lowest", "bottom", "sum", "total", "average", "avg", "mean",
            "count", "how many", "revenue", "sales", "profit", "leakage", "fee", "payout",
            "breakdown", "group by", "distribution", "summary", "stats", "correlation",
            "return rate", "returns", "sku", "product", "trend", "chart", "plot", "histogram",
            "bar chart", "scatter", "overview", "kpi", "metrics", "describe", "head"
        ]
        
        return any(k in q for k in keywords)

    def execute_query(self, query: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Executes query natively.
        Returns: (handled: bool, response_markdown: str, chart_plotly_dict: Optional[dict])
        """
        if self.df is None or self.df.empty:
            return False, "No dataset loaded for analysis.", None

        q = query.lower().strip()

        # 1. High-level Summary / Overview
        if any(w in q for w in ["summary", "overview", "describe", "kpi", "stats", "profile"]):
            return self._generate_overview()

        # 2. Amazon & Flipkart Specific Audits
        if any(w in q for w in ["leakage", "fee", "fba", "commission", "payout", "settlement"]):
            res = self._audit_ecommerce_fees()
            if res[0]:
                return res

        # 3. Top SKUs / Products / Categories by Metric
        if "top" in q or "highest" in q or "best" in q:
            res = self._analyze_top_ranking(q)
            if res[0]:
                return res

        # 4. Return Rate Analysis
        if "return" in q:
            res = self._analyze_returns()
            if res[0]:
                return res

        # 5. Generic Column Aggregations (Average, Total, Min, Max)
        if any(w in q for w in ["total", "sum", "average", "avg", "mean", "min", "max"]):
            res = self._analyze_aggregation(q)
            if res[0]:
                return res

        # 6. Plot / Visualization Requests
        if any(w in q for w in ["plot", "chart", "graph", "histogram", "bar", "visualize"]):
            res = self._generate_visualization(q)
            if res[0]:
                return res

        return False, "", None

    def _find_column(self, candidates: List[str]) -> Optional[str]:
        """Finds matching column case-insensitively."""
        cols = {c.lower(): c for c in self.df.columns}
        for cand in candidates:
            cand_lower = cand.lower()
            if cand_lower in cols:
                return cols[cand_lower]
            for c_low, orig in cols.items():
                if cand_lower in c_low:
                    return orig
        return None

    def _generate_overview(self) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Generates comprehensive dataset overview and metric summary."""
        num_rows, num_cols = self.df.shape
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = self.df.select_dtypes(exclude=[np.number]).columns.tolist()

        md = f"### 📊 Dataset Executive Overview\n\n"
        md += f"- **Total Rows (Records):** `{num_rows:,}`\n"
        md += f"- **Total Dimensions & Metrics:** `{num_cols}` columns\n"
        md += f"- **Numeric Metrics:** {', '.join([f'`{c}`' for c in numeric_cols[:8]]) or 'None'}\n"
        md += f"- **Categorical Dimensions:** {', '.join([f'`{c}`' for c in categorical_cols[:8]]) or 'None'}\n\n"

        if numeric_cols:
            stats = self.df[numeric_cols[:5]].describe().T[['mean', 'std', 'min', '50%', 'max']]
            stats.columns = ['Average', 'Std Dev', 'Min', 'Median (P50)', 'Max']
            md += "#### Key Metric Distribution:\n"
            md += stats.to_markdown() + "\n\n"

        md += "> 💡 *Ask follow-ups like 'What are the top 5 by revenue?' or 'Show me return rate analysis'.*"
        return True, md, None

    def _audit_ecommerce_fees(self) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Audits fee leakage, marketplace commissions, and net settlement."""
        rev_col = self._find_column(["item_price", "principal", "sale_amount", "amount", "total", "revenue", "price"])
        fee_col = self._find_column(["fee", "commission", "selling_fees", "fba_fees", "marketplace_fee", "shipping_fee"])
        payout_col = self._find_column(["payout", "settlement", "net_amount", "bank_deposit"])

        if not rev_col:
            return False, "", None

        total_rev = float(self.df[rev_col].sum())
        total_fee = float(self.df[fee_col].sum()) if fee_col else 0.0
        
        # Estimate or compute payout
        if payout_col:
            total_payout = float(self.df[payout_col].sum())
        else:
            total_payout = total_rev - total_fee

        fee_pct = (total_fee / total_rev * 100) if total_rev > 0 else 0.0

        md = f"### ⚡ E-Commerce Fee & Payout Audit\n\n"
        md += f"| Metric | Amount | % of Gross GMV |\n"
        md += f"| :--- | :--- | :--- |\n"
        md += f"| **Gross Revenue (GMV)** | ₹{total_rev:,.2f} | 100.0% |\n"
        if fee_col:
            md += f"| **Marketplace Fees & Deductions** | ₹{total_fee:,.2f} | {fee_pct:.1f}% |\n"
        md += f"| **Net Seller Settlement** | **₹{total_payout:,.2f}** | **{(total_payout/total_rev*100) if total_rev > 0 else 0:.1f}%** |\n\n"

        if fee_pct > 25:
            md += f"> ⚠️ **High Fee Leakage Alert:** Marketplace fees consume **{fee_pct:.1f}%** of your gross volume. Check FBA weight bands and commission tier overcharges.\n\n"
        else:
            md += f"> ✅ **Healthy Unit Economics:** Total deductions are bounded within **{fee_pct:.1f}%** of GMV.\n\n"

        return True, md, None

    def _analyze_top_ranking(self, query: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Answers top N rankings: SKUs, products, states, categories."""
        # Find dimension
        dim_col = self._find_column(["sku", "product", "title", "category", "item", "city", "state", "channel"])
        # Find metric
        metric_col = self._find_column(["revenue", "amount", "price", "sales", "total", "units", "quantity", "orders"])

        if not dim_col or not metric_col:
            return False, "", None

        # Determine limit
        limit_match = re.search(r'\b(top|first)\s+(\d+)\b', query)
        limit = int(limit_match.group(2)) if limit_match else 5
        limit = min(max(limit, 1), 20)

        sql = f"""
            SELECT "{dim_col}", SUM("{metric_col}") as total_val, COUNT(*) as count_orders
            FROM df
            GROUP BY "{dim_col}"
            ORDER BY total_val DESC
            LIMIT {limit}
        """
        result_df = self.con.execute(sql).df()

        md = f"### 🏆 Top {limit} `{dim_col}` by `{metric_col}`\n\n"
        md += f"| Rank | {dim_col} | Total {metric_col} | Order Volume |\n"
        md += f"| :---: | :--- | :--- | :--- |\n"

        for idx, row in result_df.iterrows():
            val = row['total_val']
            val_str = f"₹{val:,.2f}" if "price" in metric_col.lower() or "amount" in metric_col.lower() or "revenue" in metric_col.lower() else f"{val:,.0f}"
            md += f"| {idx+1} | **{row[dim_col]}** | {val_str} | {int(row['count_orders']):,} |\n"

        # Construct Plotly JSON chart dict
        plotly_dict = {
            "data": [{
                "x": result_df[dim_col].tolist(),
                "y": result_df['total_val'].tolist(),
                "type": "bar",
                "marker": {"color": "#0ea5e9"}
            }],
            "layout": {
                "title": f"Top {limit} {dim_col} by {metric_col}",
                "template": "plotly_dark",
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": {"color": "#e2e8f0"}
            }
        }

        md += f"\n<<<PLOTLY_JSON_START>>>{json.dumps(plotly_dict)}<<<PLOTLY_JSON_END>>>\n"
        return True, md, plotly_dict

    def _analyze_returns(self) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Calculates exact return rates, returned SKU leakage, and loss."""
        status_col = self._find_column(["status", "order_status", "return", "refund_status"])
        rev_col = self._find_column(["amount", "price", "principal", "total", "revenue"])

        if not status_col:
            return False, "Could not locate an order status or return status column to compute return rates.", None

        sql = f"""
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN LOWER(CAST("{status_col}" AS VARCHAR)) LIKE '%return%' 
                              OR LOWER(CAST("{status_col}" AS VARCHAR)) LIKE '%refund%' 
                              OR LOWER(CAST("{status_col}" AS VARCHAR)) LIKE '%cancel%' 
                         THEN 1 ELSE 0 END) as returned_orders
            FROM df
        """
        stats = self.con.execute(sql).df().iloc[0]
        total = int(stats['total_orders'])
        returned = int(stats['returned_orders'])
        rate = (returned / total * 100) if total > 0 else 0.0

        md = f"### 🔄 Return & RTO Analysis\n\n"
        md += f"- **Total Orders Sampled:** `{total:,}`\n"
        md += f"- **Returned / Refunded Orders:** `{returned:,}`\n"
        md += f"- **Overall Return Rate:** **`{rate:.2f}%`**\n\n"

        if rate > 15:
            md += f"> 🚨 **High Return Leakage:** Your return rate ({rate:.2f}%) exceeds the 12% industry baseline. Recommended to audit sizing and packaging quality.\n"
        else:
            md += f"> ✅ Return rate ({rate:.2f}%) is within healthy e-commerce operational limits.\n"

        return True, md, None

    def _analyze_aggregation(self, query: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Handles descriptive questions like 'what is the average order value' or 'total revenue'."""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        if not numeric_cols:
            return False, "", None

        # Look for referenced column
        target_col = None
        for col in numeric_cols:
            if col.lower() in query:
                target_col = col
                break
        
        if not target_col:
            target_col = self._find_column(["revenue", "amount", "price", "total", "sales"]) or numeric_cols[0]

        total = float(self.df[target_col].sum())
        avg = float(self.df[target_col].mean())
        p50 = float(self.df[target_col].median())
        min_val = float(self.df[target_col].min())
        max_val = float(self.df[target_col].max())

        is_currency = any(w in target_col.lower() for w in ["price", "amount", "revenue", "fee", "payout", "cost"])
        prefix = "₹" if is_currency else ""

        md = f"### 📈 Summary Metrics for `{target_col}`\n\n"
        md += f"- **Total Cumulative:** `{prefix}{total:,.2f}`\n"
        md += f"- **Average (Mean):** `{prefix}{avg:,.2f}`\n"
        md += f"- **Median (P50):** `{prefix}{p50:,.2f}`\n"
        md += f"- **Range:** `{prefix}{min_val:,.2f}` to `{prefix}{max_val:,.2f}`\n"

        return True, md, None

    def _generate_visualization(self, query: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Generates distribution plots or histograms."""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        if not numeric_cols:
            return False, "", None

        col = numeric_cols[0]
        for c in numeric_cols:
            if c.lower() in query:
                col = c
                break

        plotly_dict = {
            "data": [{
                "x": self.df[col].dropna().head(500).tolist(),
                "type": "histogram",
                "marker": {"color": "#10b981"}
            }],
            "layout": {
                "title": f"Distribution of {col}",
                "template": "plotly_dark",
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": {"color": "#e2e8f0"}
            }
        }

        md = f"Generated distribution visualization for `{col}`:\n\n"
        md += f"<<<PLOTLY_JSON_START>>>{json.dumps(plotly_dict)}<<<PLOTLY_JSON_END>>>\n"
        return True, md, plotly_dict
