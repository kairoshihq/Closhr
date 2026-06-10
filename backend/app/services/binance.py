import httpx

BINANCE_BASE = "https://api.binance.com/api/v3"


async def fetch_live_prices(symbols: list[str]) -> dict[str, float]:
    """
    Fetch live USDT prices from Binance for given base symbols (e.g. ['BTC', 'ETH']).
    Returns a dict: { 'BTC': 67000.0, 'ETH': 3500.0, ... }
    """
    if not symbols:
        return {}

    pairs = [f'"{s.upper()}USDT"' for s in symbols]
    query = f"[{','.join(pairs)}]"

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            f"{BINANCE_BASE}/ticker/price",
            params={"symbols": query},
        )
        if res.status_code != 200:
            return {}
        data = res.json()

    prices: dict[str, float] = {}
    for item in data:
        base = item["symbol"].replace("USDT", "")
        try:
            prices[base] = float(item["price"])
        except (ValueError, KeyError):
            pass

    return prices


async def fetch_24h_changes(symbols: list[str]) -> dict[str, float]:
    """
    Fetch 24h price change percentage from Binance.
    Returns a dict: { 'BTC': 2.34, 'ETH': -1.12, ... }
    """
    if not symbols:
        return {}

    pairs = [f'"{s.upper()}USDT"' for s in symbols]
    query = f"[{','.join(pairs)}]"

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            f"{BINANCE_BASE}/ticker/24hr",
            params={"symbols": query},
        )
        if res.status_code != 200:
            return {}
        data = res.json()

    changes: dict[str, float] = {}
    for item in data:
        base = item["symbol"].replace("USDT", "")
        try:
            changes[base] = float(item["priceChangePercent"])
        except (ValueError, KeyError):
            pass

    return changes