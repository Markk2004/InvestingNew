import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface CacheEntry {
  data: TickerData;
  timestamp: number;
}

// Simple in-memory cache to prevent rate-limiting
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 10000; // 10 seconds cache TTL



async function fetchFromYahooBulk(symbols: string[]): Promise<TickerData[]> {
  if (symbols.length === 0) return [];
  // Yahoo Spark API supports multiple comma-separated symbols
  const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols.join(",")}&range=1d&interval=1d`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Yahoo Bulk HTTP ${response.status}`);
  }

  const data = await response.json();
  const results: TickerData[] = [];

  for (const sym of symbols) {
    const item = data[sym];
    if (item && item.close && item.close.length > 0) {
      const price = item.close[item.close.length - 1];
      const prevClose = item.previousClose ?? item.chartPreviousClose ?? price;
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      results.push({ symbol: sym, price, change, changePercent });
    }
  }

  return results;
}

const YAHOO_SYMBOL_MAP: Record<string, string> = {
  'XAUUSD': 'GC=F',
  'GOLD': 'GC=F',
  'XAUSD': 'GC=F',
  'XAAUSD': 'GC=F', // Common typo fallback
  'TVCGOLD': 'GC=F', // Stripped fallback
  'BTCUSD': 'BTC-USD',
  'BTC': 'BTC-USD',
  'ETHUSD': 'ETH-USD',
  'ETH': 'ETH-USD',
  'SOLUSD': 'SOL-USD',
  'SOL': 'SOL-USD',
  'USDTUSD': 'USDT-USD',
  'USDT': 'USDT-USD',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || 'AAPL,MSFT,NVDA,SPY,QQQ,TSLA,AMZN';
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  const now = Date.now();

  try {
    // 1. Check cache first
    const uncachedSymbols: string[] = [];
    const activeResults: TickerData[] = [];

    for (const sym of symbols) {
      const cached = cache[sym];
      if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
        activeResults.push(cached.data);
      } else {
        uncachedSymbols.push(sym);
      }
    }

    // 2. Fetch uncached symbols
    if (uncachedSymbols.length > 0) {
      // Map uncached symbols to their Yahoo tickers, keeping track of mapping back
      const yahooToOriginals: Record<string, string[]> = {};
      const yahooTickersToFetch: string[] = [];

      for (const sym of uncachedSymbols) {
        // Strip TradingView-style prefix if present (e.g. "OANDA:XAUUSD" -> "XAUUSD")
        const baseSym = sym.includes(":") ? sym.split(":")[1] : sym;
        const yahooSym = YAHOO_SYMBOL_MAP[baseSym] || baseSym;
        if (!yahooToOriginals[yahooSym]) {
          yahooToOriginals[yahooSym] = [];
          yahooTickersToFetch.push(yahooSym);
        }
        yahooToOriginals[yahooSym].push(sym);
      }

      // Fast Bulk Yahoo Fetch! (Yahoo Spark API supports max 20 symbols per request)
      const CHUNK_SIZE = 20;
      const chunks: string[][] = [];
      for (let i = 0; i < yahooTickersToFetch.length; i += CHUNK_SIZE) {
        chunks.push(yahooTickersToFetch.slice(i, i + CHUNK_SIZE));
      }

      const chunkPromises = chunks.map(async (chunk) => {
        try {
          return await fetchFromYahooBulk(chunk);
        } catch (err) {
          console.error(`Yahoo Bulk failed for chunk: ${chunk.join(",")}. Falling back to individual fetches.`, err);
          // Fallback: Fetch each symbol in the failed chunk individually so valid symbols still load
          const individualPromises = chunk.map(async (sym) => {
            try {
              return await fetchFromYahooBulk([sym]);
            } catch (singleErr) {
              console.warn(`Yahoo fetch failed for individual symbol: ${sym}`, singleErr);
              return [];
            }
          });
          const individualResults = await Promise.all(individualPromises);
          return individualResults.flat();
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      for (const bulkRes of chunkResults) {
        for (const r of bulkRes) {
          const originalSymbols = yahooToOriginals[r.symbol] || [r.symbol];
          for (const origSym of originalSymbols) {
            const mappedResult = {
              symbol: origSym,
              price: r.price,
              change: r.change,
              changePercent: r.changePercent
            };
            cache[origSym] = { data: mappedResult, timestamp: now };
            activeResults.push(mappedResult);
          }
        }
      }
    }

    if (activeResults.length === 0) {
      return NextResponse.json({ error: "No symbols loaded" }, { status: 404 });
    }

    return NextResponse.json(activeResults);
  } catch (error: any) {
    console.error("Error fetching ticker data:", error);
    try {
      await fetch("http://localhost:8080/api/system/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "error",
          message: error?.message || "Error fetching ticker data",
          stack_trace: error?.stack || null,
          url: "Next.js /api/ticker"
        })
      });
    } catch (logErr) {
      console.error("Failed to forward Next.js error to Laravel:", logErr);
    }
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}


