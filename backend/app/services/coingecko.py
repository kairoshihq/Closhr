import httpx
from typing import Optional

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

HEADERS = {
    "accept": "application/json",
}

TOP_COINS = [
    "bitcoin", "ethereum", "binancecoin", "solana", "ripple",
    "cardano", "avalanche-2", "polkadot", "chainlink", "dogecoin",
    "shiba-inu", "tron", "near", "litecoin", "uniswap",
    "stellar", "monero", "okb", "cosmos", "internet-computer",
]


async def fetch_coins_metadata(coin_ids: Optional[list[str]] = None) -> list[dict]:
    ids = ",".join(coin_ids or TOP_COINS)
    params = {
        "vs_currency": "usd",
        "ids": ids,
        "order": "market_cap_desc",
        "per_page": len(coin_ids or TOP_COINS),
        "page": 1,
        "sparkline": True,
        "price_change_percentage": "1h,24h,7d,30d",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{COINGECKO_BASE}/coins/markets", params=params, headers=HEADERS)
        res.raise_for_status()
        return res.json()


async def fetch_trending_coins() -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{COINGECKO_BASE}/search/trending", headers=HEADERS)
        res.raise_for_status()
        data = res.json()
        coin_ids = [item["item"]["id"] for item in data.get("coins", [])[:7]]
        if not coin_ids:
            return []
        return await fetch_coins_metadata(coin_ids)