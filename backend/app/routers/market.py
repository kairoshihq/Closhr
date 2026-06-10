from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.coingecko import fetch_coins_metadata, fetch_trending_coins
from app.services.binance import fetch_live_prices, fetch_24h_changes

router = APIRouter(prefix="/market", tags=["market"])


class CoinPrice(BaseModel):
    id: str
    symbol: str
    name: str
    price: float
    change1d: float
    change7d: float
    change30d: float
    marketCap: float
    volume24h: float
    sparkline: list[float]


def _build_coin_price(gecko: dict, live_prices: dict, live_changes: dict) -> CoinPrice:
    symbol = gecko.get("symbol", "").upper()

    price = live_prices.get(symbol) or gecko.get("current_price") or 0.0
    change1d = live_changes.get(symbol) or gecko.get("price_change_percentage_24h") or 0.0

    sparkline_raw = gecko.get("sparkline_in_7d", {}) or {}
    sparkline = sparkline_raw.get("price", [])
    # Downsample to 24 points to keep payload small
    if len(sparkline) > 24:
        step = len(sparkline) // 24
        sparkline = sparkline[::step][:24]

    return CoinPrice(
        id=gecko.get("id", ""),
        symbol=symbol,
        name=gecko.get("name", ""),
        price=price,
        change1d=change1d,
        change7d=gecko.get("price_change_percentage_7d_in_currency") or 0.0,
        change30d=gecko.get("price_change_percentage_30d_in_currency") or 0.0,
        marketCap=gecko.get("market_cap") or 0.0,
        volume24h=gecko.get("total_volume") or 0.0,
        sparkline=sparkline,
    )


@router.get("", response_model=list[CoinPrice])
async def get_market():
    try:
        gecko_data = await fetch_coins_metadata()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko error: {e}")

    symbols = [c.get("symbol", "").upper() for c in gecko_data]

    try:
        live_prices, live_changes = await _fetch_binance(symbols)
    except Exception:
        live_prices, live_changes = {}, {}

    return [_build_coin_price(c, live_prices, live_changes) for c in gecko_data]


@router.get("/trending", response_model=list[CoinPrice])
async def get_trending():
    try:
        gecko_data = await fetch_trending_coins()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko trending error: {e}")

    if not gecko_data:
        return []

    symbols = [c.get("symbol", "").upper() for c in gecko_data]

    try:
        live_prices, live_changes = await _fetch_binance(symbols)
    except Exception:
        live_prices, live_changes = {}, {}

    return [_build_coin_price(c, live_prices, live_changes) for c in gecko_data]


async def _fetch_binance(symbols: list[str]) -> tuple[dict, dict]:
    live_prices = await fetch_live_prices(symbols)
    live_changes = await fetch_24h_changes(symbols)
    return live_prices, live_changes