import { NextResponse } from 'next/server';

// Ticker endpoint to fetch real-time data from Yahoo Finance
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols') || 'AAPL,MSFT,NVDA,SPY,QQQ,TSLA,AMZN';

  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    const response = await fetch(url, {
      // Add a simple user-agent to prevent blocks
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Ensure we don't aggressively cache the data
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];
    
    // Map to a cleaner format
    const results = quotes.map((q: any) => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching ticker data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
