import httpx
import time
from typing import Optional

COINGECKO_BASE = "https://api.coingecko.com/api/v3"
HEADERS = {"accept": "application/json"}

TOP_COINS = [
    "bitcoin", "ethereum", "binancecoin", "solana", "ripple",
    "cardano", "avalanche-2", "polkadot", "chainlink", "dogecoin",
    "shiba-inu", "tron", "near", "litecoin", "uniswap",
    "stellar", "monero", "okb", "cosmos", "internet-computer","sui",
]

# Simple in-memory cache
_cache: dict = {}
CACHE_TTL = 60  # detik


def _get_cache(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None


def _set_cache(key: str, data):
    _cache[key] = {"data": data, "ts": time.time()}


async def fetch_coins_metadata(coin_ids: Optional[list[str]] = None) -> list[dict]:
    cache_key = "coins_" + ",".join(coin_ids or TOP_COINS)
    cached = _get_cache(cache_key)
    if cached:
        return cached

    ids = ",".join(coin_ids or TOP_COINS)
    params = {
        "vs_currency": "usd",
        "ids": ids,
        "order": "market_cap_desc",
        "per_page": len(coin_ids or TOP_COINS),
        "page": 1,
        "sparkline": True,
        "price_change_percentage": "24h,7d,30d",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{COINGECKO_BASE}/coins/markets", params=params, headers=HEADERS)
        res.raise_for_status()
        data = res.json()

    _set_cache(cache_key, data)
    return data


async def fetch_trending_coins() -> list[dict]:
    cached = _get_cache("trending")
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{COINGECKO_BASE}/search/trending", headers=HEADERS)
        res.raise_for_status()
        data = res.json()
        coin_ids = [item["item"]["id"] for item in data.get("coins", [])[:7]]
        if not coin_ids:
            return []

    result = await fetch_coins_metadata(coin_ids)
    _set_cache("trending", result)
    return result