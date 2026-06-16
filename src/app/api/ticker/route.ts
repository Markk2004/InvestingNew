import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ticker endpoint to fetch real-time data from Yahoo Finance chart endpoint (bypassing public quote blocks)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || 'AAPL,MSFT,NVDA,SPY,QQQ,TSLA,AMZN';
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 60 }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) {
            throw new Error("Invalid structure");
          }

          const price = meta.regularMarketPrice;
          const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
          const change = price - prevClose;
          const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

          return {
            symbol,
            price,
            change,
            changePercent
          };
        } catch (err) {
          console.error(`Error fetching symbol ${symbol} via v8 chart:`, err);
          return null;
        }
      })
    );

    // Filter out any failed symbols
    const activeResults = results.filter((r): r is NonNullable<typeof r> => r !== null);

    if (activeResults.length === 0) {
      throw new Error("All symbols failed to load");
    }

    return NextResponse.json(activeResults);
  } catch (error) {
    console.error("Error fetching ticker data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

