import logging
import io
import re
import csv
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

class NormalizedOrder(BaseModel):
    channel: str # 'amazon', 'flipkart', 'shopify', 'generic'
    order_id: str
    order_date: str
    sku: str
    product_name: str
    quantity: int
    gross_sales: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    net_sales: float
    shipping_cost: float = 0.0
    marketplace_commission: float = 0.0
    settlement_amount: float = 0.0
    status: str
    customer_state: Optional[str] = None
    customer_city: Optional[str] = None
    fulfillment_type: Optional[str] = None # FBA, EasyShip, FBF, SellerOwn

class MarketplaceAnalyticsSummary(BaseModel):
    channel: str
    total_orders: int
    total_units: int
    gross_gmv: float
    net_gmv: float
    total_commission_fees: float
    net_settlement_payout: float
    blended_take_rate_pct: float
    average_order_value: float
    top_skus: List[Dict[str, Any]]
    return_rate_pct: float

def clean_currency(val: Any, default: float = 0.0) -> float:
    if val is None or pd.isna(val):
        return default
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).replace('₹', '').replace('$', '').replace(',', '').strip()
    try:
        return float(val_str)
    except Exception:
        return default

def clean_int(val: Any, default: int = 0) -> int:
    if val is None or pd.isna(val):
        return default
    try:
        return int(float(str(val).replace(',', '').strip()))
    except Exception:
        return default

class AmazonSPNormalizer:
    """Normalizes Amazon Seller Central MTR (Merchant Tax Report), Settlement V2, and Order Reports."""
    
    @staticmethod
    def normalize(df: pd.DataFrame) -> List[NormalizedOrder]:
        col_map = {col.lower().strip(): col for col in df.columns}
        orders: List[NormalizedOrder] = []

        for _, row in df.iterrows():
            order_id = str(row.get(col_map.get('order id', col_map.get('amazon order id', 'order_id')), 'UNKNOWN'))
            if not order_id or order_id == 'UNKNOWN' or order_id == 'nan':
                continue
            
            sku = str(row.get(col_map.get('sku', col_map.get('seller sku', 'sku')), 'N/A'))
            product_name = str(row.get(col_map.get('product name', col_map.get('title', col_map.get('item description', ''))), sku))
            order_date = str(row.get(col_map.get('order date', col_map.get('purchase date', col_map.get('posted date', ''))), ''))
            qty = clean_int(row.get(col_map.get('quantity', col_map.get('qty', 1)), 1))
            
            # Price components
            item_price = clean_currency(row.get(col_map.get('item price', col_map.get('principal', col_map.get('item-price', 0))), 0))
            tax = clean_currency(row.get(col_map.get('tax', col_map.get('item tax', 0)), 0))
            commission = abs(clean_currency(row.get(col_map.get('commission', col_map.get('selling fees', 0)), 0)))
            shipping = clean_currency(row.get(col_map.get('shipping price', col_map.get('shipping', 0)), 0))
            
            gross = item_price if item_price > 0 else (clean_currency(row.get(col_map.get('total', 0))))
            net = gross - commission
            settlement = row.get(col_map.get('settlement amount', col_map.get('net amount', net)), net)
            status = str(row.get(col_map.get('order status', col_map.get('status', 'Shipped')), 'Delivered'))
            state = str(row.get(col_map.get('ship state', col_map.get('recipient state', '')), ''))
            city = str(row.get(col_map.get('ship city', col_map.get('recipient city', '')), ''))
            fulfillment = str(row.get(col_map.get('fulfillment channel', col_map.get('fulfillment', 'FBA')), 'FBA'))

            orders.append(NormalizedOrder(
                channel='amazon',
                order_id=order_id,
                order_date=order_date,
                sku=sku,
                product_name=product_name,
                quantity=qty,
                gross_sales=gross,
                discount_amount=0.0,
                tax_amount=tax,
                net_sales=net,
                shipping_cost=shipping,
                marketplace_commission=commission,
                settlement_amount=clean_currency(settlement),
                status=status,
                customer_state=state,
                customer_city=city,
                fulfillment_type=fulfillment
            ))
        return orders

class FlipkartNormalizer:
    """Normalizes Flipkart Seller Hub Order and Settlement/Payment CSV Reports."""

    @staticmethod
    def normalize(df: pd.DataFrame) -> List[NormalizedOrder]:
        col_map = {col.lower().strip(): col for col in df.columns}
        orders: List[NormalizedOrder] = []

        for _, row in df.iterrows():
            order_id = str(row.get(col_map.get('order id', col_map.get('order item id', col_map.get('order_id', ''))), 'UNKNOWN'))
            if not order_id or order_id == 'UNKNOWN' or order_id == 'nan':
                continue

            sku = str(row.get(col_map.get('fsn', col_map.get('sku', col_map.get('seller sku', ''))), 'N/A'))
            product_name = str(row.get(col_map.get('product title', col_map.get('title', col_map.get('item description', ''))), sku))
            order_date = str(row.get(col_map.get('order date', col_map.get('order approval date', '')), ''))
            qty = clean_int(row.get(col_map.get('quantity', 1), 1))

            selling_price = clean_currency(row.get(col_map.get('selling price', col_map.get('item price', col_map.get('final invoice amount', 0))), 0))
            marketplace_fee = abs(clean_currency(row.get(col_map.get('marketplace fee', col_map.get('commission fee', col_map.get('total marketplace fees', 0))), 0)))
            shipping_fee = abs(clean_currency(row.get(col_map.get('shipping fee', 0)), 0))
            settlement = clean_currency(row.get(col_map.get('settlement value', col_map.get('bank settlement value', selling_price - marketplace_fee)), selling_price - marketplace_fee))
            status = str(row.get(col_map.get('order status', col_map.get('status', 'DELIVERED')), 'Delivered'))
            state = str(row.get(col_map.get('delivery state', col_map.get('state', '')), ''))
            city = str(row.get(col_map.get('delivery city', col_map.get('city', '')), ''))

            orders.append(NormalizedOrder(
                channel='flipkart',
                order_id=order_id,
                order_date=order_date,
                sku=sku,
                product_name=product_name,
                quantity=qty,
                gross_sales=selling_price,
                discount_amount=0.0,
                tax_amount=0.0,
                net_sales=selling_price - marketplace_fee,
                shipping_cost=shipping_fee,
                marketplace_commission=marketplace_fee,
                settlement_amount=settlement,
                status=status,
                customer_state=state,
                customer_city=city,
                fulfillment_type='FBF'
            ))
        return orders

@router.post("/parse-report")
async def parse_seller_report(
    channel: str = Form(..., description="'amazon' or 'flipkart'"),
    file: UploadFile = File(...)
):
    """
    Parses Amazon or Flipkart Seller reports (CSV / TSV), cleans currency formatting, 
    normalizes into a standard unified schema, and provides instant financial audit metrics.
    """
    try:
        content = await file.read()
        try:
            # Try utf-8 first, fallback to latin-1
            df = pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='latin-1')

        channel_clean = channel.lower().strip()
        if 'amazon' in channel_clean:
            normalized = AmazonSPNormalizer.normalize(df)
        elif 'flipkart' in channel_clean:
            normalized = FlipkartNormalizer.normalize(df)
        else:
            raise HTTPException(status_code=400, detail="Unsupported channel. Use 'amazon' or 'flipkart'.")

        if not normalized:
            raise HTTPException(status_code=400, detail="Could not extract orders from this file format.")

        norm_df = pd.DataFrame([o.model_dump() for o in normalized])
        total_orders = len(norm_df)
        total_units = int(norm_df['quantity'].sum())
        gross_gmv = float(norm_df['gross_sales'].sum())
        net_gmv = float(norm_df['net_sales'].sum())
        commission = float(norm_df['marketplace_commission'].sum())
        payout = float(norm_df['settlement_amount'].sum())
        take_rate = (commission / gross_gmv * 100) if gross_gmv > 0 else 0.0
        aov = (gross_gmv / total_orders) if total_orders > 0 else 0.0

        # Top SKUs by revenue
        sku_grp = norm_df.groupby('sku').agg({
            'gross_sales': 'sum',
            'quantity': 'sum',
            'product_name': 'first'
        }).reset_index().sort_values(by='gross_sales', ascending=False).head(5)

        top_skus = sku_grp.to_dict(orient='records')
        returned_orders = len(norm_df[norm_df['status'].str.lower().str.contains('return|cancel|refund', na=False)])
        return_rate = (returned_orders / total_orders * 100) if total_orders > 0 else 0.0

        summary = MarketplaceAnalyticsSummary(
            channel=channel_clean,
            total_orders=total_orders,
            total_units=total_units,
            gross_gmv=round(gross_gmv, 2),
            net_gmv=round(net_gmv, 2),
            total_commission_fees=round(commission, 2),
            net_settlement_payout=round(payout, 2),
            blended_take_rate_pct=round(take_rate, 2),
            average_order_value=round(aov, 2),
            top_skus=top_skus,
            return_rate_pct=round(return_rate, 2)
        )

        return {
            "status": "success",
            "summary": summary.model_dump(),
            "sample_orders": normalized[:10],
            "total_records": total_orders
        }
    except Exception as e:
        logger.error(f"Error parsing seller report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse seller file: {str(e)}")

@router.get("/connectors-status")
def get_connectors_status():
    """Returns available marketplace connectors and their readiness."""
    return {
        "connectors": [
            {
                "id": "amazon_sp",
                "name": "Amazon Seller Central (SP-API & MTR Reports)",
                "status": "ready",
                "features": ["MTR Report Parser", "Settlement V2 Parser", "FBA Fee Audit", "Zero-Copy DuckDB Loading"]
            },
            {
                "id": "flipkart_hub",
                "name": "Flipkart Seller Hub",
                "status": "ready",
                "features": ["Settlement CSV Ingestion", "FSN-Level Profitability", "Marketplace Fee Audit", "Return Tracking"]
            },
            {
                "id": "shopify",
                "name": "Shopify GraphQL & Parquet Export",
                "status": "ready",
                "features": ["Real-time Order Ingestion", "Customer LTV Cohorts", "Multi-Currency Conversion"]
            }
        ]
    }
