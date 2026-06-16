export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

// Top US stocks by sector
export const US_STOCKS: StockInfo[] = [
  // Technology
  { symbol: "AAPL",  name: "Apple Inc.",            sector: "Technology", exchange: "NASDAQ" },
  { symbol: "MSFT",  name: "Microsoft Corp.",        sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",           sector: "Technology", exchange: "NASDAQ" },
  { symbol: "GOOG",  name: "Alphabet Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "META",  name: "Meta Platforms",         sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AVGO",  name: "Broadcom Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMD",   name: "Advanced Micro Devices", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "INTC",  name: "Intel Corp.",            sector: "Technology", exchange: "NASDAQ" },
  { symbol: "QCOM",  name: "QUALCOMM Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "TXN",   name: "Texas Instruments",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMAT",  name: "Applied Materials",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "MU",    name: "Micron Technology",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "LRCX",  name: "Lam Research",           sector: "Technology", exchange: "NASDAQ" },
  { symbol: "KLAC",  name: "KLA Corp.",              sector: "Technology", exchange: "NASDAQ" },
  { symbol: "ORCL",  name: "Oracle Corp.",           sector: "Technology", exchange: "NYSE"   },
  { symbol: "CRM",   name: "Salesforce Inc.",        sector: "Technology", exchange: "NYSE"   },
  { symbol: "ADBE",  name: "Adobe Inc.",             sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NOW",   name: "ServiceNow Inc.",        sector: "Technology", exchange: "NYSE"   },
  { symbol: "SNOW",  name: "Snowflake Inc.",         sector: "Technology", exchange: "NYSE"   },
  { symbol: "PLTR",  name: "Palantir Technologies",  sector: "Technology", exchange: "NASDAQ" },
  { symbol: "IREN",  name: "Iris Energy Limited",    sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NVTS",  name: "Navitas Semiconductor",  sector: "Technology", exchange: "NASDAQ" },
  { symbol: "BTDR",  name: "Bitdeer Technologies",   sector: "Technology", exchange: "NASDAQ" },
  { symbol: "DOCN",  name: "DigitalOcean Holdings",  sector: "Technology", exchange: "NYSE"   },
  { symbol: "ONDS",  name: "Ondas Holdings Inc.",    sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AEHR",  name: "Aehr Test Systems",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "RKLB",  name: "Rocket Lab USA, Inc.",   sector: "Technology", exchange: "NASDAQ" },

  // Consumer / E-commerce
  { symbol: "AMZN",  name: "Amazon.com Inc.",        sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "TSLA",  name: "Tesla Inc.",             sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "HD",    name: "Home Depot Inc.",        sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "MCD",   name: "McDonald's Corp.",       sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "SBUX",  name: "Starbucks Corp.",        sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "NKE",   name: "Nike Inc.",              sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "COST",  name: "Costco Wholesale",       sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "WMT",   name: "Walmart Inc.",           sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "TGT",   name: "Target Corp.",           sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "EBAY",  name: "eBay Inc.",              sector: "Consumer",   exchange: "NASDAQ" },

  // Finance
  { symbol: "JPM",   name: "JPMorgan Chase",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "BAC",   name: "Bank of America",        sector: "Finance",    exchange: "NYSE"   },
  { symbol: "WFC",   name: "Wells Fargo",            sector: "Finance",    exchange: "NYSE"   },
  { symbol: "GS",    name: "Goldman Sachs",          sector: "Finance",    exchange: "NYSE"   },
  { symbol: "MS",    name: "Morgan Stanley",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "V",     name: "Visa Inc.",              sector: "Finance",    exchange: "NYSE"   },
  { symbol: "MA",    name: "Mastercard Inc.",        sector: "Finance",    exchange: "NYSE"   },
  { symbol: "PYPL",  name: "PayPal Holdings",        sector: "Finance",    exchange: "NASDAQ" },
  { symbol: "BLK",   name: "BlackRock Inc.",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "COIN",  name: "Coinbase Global",        sector: "Finance",    exchange: "NASDAQ" },

  // Healthcare
  { symbol: "JNJ",   name: "Johnson & Johnson",      sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "UNH",   name: "UnitedHealth Group",     sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "PFE",   name: "Pfizer Inc.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "ABBV",  name: "AbbVie Inc.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "LLY",   name: "Eli Lilly",              sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "MRK",   name: "Merck & Co.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "TMO",   name: "Thermo Fisher",          sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "ABT",   name: "Abbott Laboratories",    sector: "Healthcare", exchange: "NYSE"   },

  // Energy
  { symbol: "XOM",   name: "Exxon Mobil",            sector: "Energy",     exchange: "NYSE"   },
  { symbol: "CVX",   name: "Chevron Corp.",          sector: "Energy",     exchange: "NYSE"   },
  { symbol: "COP",   name: "ConocoPhillips",         sector: "Energy",     exchange: "NYSE"   },
  { symbol: "SLB",   name: "Schlumberger Ltd.",      sector: "Energy",     exchange: "NYSE"   },
  { symbol: "OXY",   name: "Occidental Petroleum",   sector: "Energy",     exchange: "NYSE"   },
  { symbol: "TVC:GOLD",     name: "Gold Spot (TVC)",         sector: "Energy",     exchange: "TVC" },
  { symbol: "OANDA:XAUUSD", name: "Gold Spot (OANDA)",       sector: "Energy",     exchange: "OANDA" },
  { symbol: "FLNC",  name: "Fluence Energy, Inc.",   sector: "Energy",     exchange: "NASDAQ" },
  { symbol: "EOSE",  name: "Eos Energy Enterprises", sector: "Energy",     exchange: "NASDAQ" },

  // Comm & Media
  { symbol: "NFLX",  name: "Netflix Inc.",           sector: "Media",      exchange: "NASDAQ" },
  { symbol: "DIS",   name: "The Walt Disney Co.",    sector: "Media",      exchange: "NYSE"   },
  { symbol: "T",     name: "AT&T Inc.",              sector: "Media",      exchange: "NYSE"   },
  { symbol: "VZ",    name: "Verizon Comm.",          sector: "Media",      exchange: "NYSE"   },
  { symbol: "CMCSA", name: "Comcast Corp.",          sector: "Media",      exchange: "NASDAQ" },

  // Index / ETF
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",      sector: "ETF",        exchange: "NYSE"   },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",      sector: "ETF",        exchange: "NASDAQ" },
  { symbol: "IWM",   name: "iShares Russell 2000",   sector: "ETF",        exchange: "NYSE"   },
  { symbol: "DIA",   name: "SPDR Dow Jones ETF",     sector: "ETF",        exchange: "NYSE"   },
  { symbol: "SPCX",  name: "Spectra ESG ETF",        sector: "ETF",        exchange: "NASDAQ" },
];

/**
 * Returns the correct TradingView prefix symbol (e.g. NYSE:JPM, NASDAQ:AAPL)
 */
export function getTradingViewSymbol(symbol: string): string {
  if (!symbol) return "";
  const upperSymbol = symbol.toUpperCase();
  if (upperSymbol.includes(":")) {
    return upperSymbol;
  }
  const stock = US_STOCKS.find((s) => s.symbol.toUpperCase() === upperSymbol);
  if (stock) {
    return `${stock.exchange}:${stock.symbol}`;
  }
  // Default fallback to NASDAQ if not in list
  return `NASDAQ:${symbol}`;
}
