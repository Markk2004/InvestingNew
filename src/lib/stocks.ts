export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

// Top US stocks by sector (Standard GICS classification)
export const US_STOCKS: StockInfo[] = [
  // Information Technology
  { symbol: "AAPL",  name: "Apple Inc.",            sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "MSFT",  name: "Microsoft Corp.",        sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",           sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "AVGO",  name: "Broadcom Inc.",          sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "AMD",   name: "Advanced Micro Devices", sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "INTC",  name: "Intel Corp.",            sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "QCOM",  name: "QUALCOMM Inc.",          sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "TXN",   name: "Texas Instruments",      sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "AMAT",  name: "Applied Materials",      sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "MU",    name: "Micron Technology",      sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "LRCX",  name: "Lam Research",           sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "KLAC",  name: "KLA Corp.",              sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "ORCL",  name: "Oracle Corp.",           sector: "Information Technology", exchange: "NYSE"   },
  { symbol: "CRM",   name: "Salesforce Inc.",        sector: "Information Technology", exchange: "NYSE"   },
  { symbol: "ADBE",  name: "Adobe Inc.",             sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "NOW",   name: "ServiceNow Inc.",        sector: "Information Technology", exchange: "NYSE"   },
  { symbol: "SNOW",  name: "Snowflake Inc.",         sector: "Information Technology", exchange: "NYSE"   },
  { symbol: "PLTR",  name: "Palantir Technologies",  sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "IREN",  name: "Iris Energy Limited",    sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "NVTS",  name: "Navitas Semiconductor",  sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "BTDR",  name: "Bitdeer Technologies",   sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "DOCN",  name: "DigitalOcean Holdings",  sector: "Information Technology", exchange: "NYSE"   },
  { symbol: "ONDS",  name: "Ondas Holdings Inc.",    sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "AEHR",  name: "Aehr Test Systems",      sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "FLNC",  name: "Fluence Energy, Inc.",   sector: "Information Technology", exchange: "NASDAQ" },
  { symbol: "EOSE",  name: "Eos Energy Enterprises", sector: "Information Technology", exchange: "NASDAQ" },

  // Communication Services
  { symbol: "GOOG",  name: "Alphabet Inc.",          sector: "Communication Services", exchange: "NASDAQ" },
  { symbol: "META",  name: "Meta Platforms",         sector: "Communication Services", exchange: "NASDAQ" },
  { symbol: "NFLX",  name: "Netflix Inc.",           sector: "Communication Services", exchange: "NASDAQ" },
  { symbol: "DIS",   name: "The Walt Disney Co.",    sector: "Communication Services", exchange: "NYSE"   },
  { symbol: "T",     name: "AT&T Inc.",              sector: "Communication Services", exchange: "NYSE"   },
  { symbol: "VZ",    name: "Verizon Comm.",          sector: "Communication Services", exchange: "NYSE"   },
  { symbol: "CMCSA", name: "Comcast Corp.",          sector: "Communication Services", exchange: "NASDAQ" },

  // Consumer Discretionary
  { symbol: "AMZN",  name: "Amazon.com Inc.",        sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "TSLA",  name: "Tesla Inc.",             sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "HD",    name: "Home Depot Inc.",        sector: "Consumer Discretionary", exchange: "NYSE"   },
  { symbol: "MCD",   name: "McDonald's Corp.",       sector: "Consumer Discretionary", exchange: "NYSE"   },
  { symbol: "SBUX",  name: "Starbucks Corp.",        sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "NKE",   name: "Nike Inc.",              sector: "Consumer Discretionary", exchange: "NYSE"   },
  { symbol: "EBAY",  name: "eBay Inc.",              sector: "Consumer Discretionary", exchange: "NASDAQ" },

  // Consumer Staples
  { symbol: "COST",  name: "Costco Wholesale",       sector: "Consumer Staples",   exchange: "NASDAQ" },
  { symbol: "WMT",   name: "Walmart Inc.",           sector: "Consumer Staples",   exchange: "NYSE"   },
  { symbol: "TGT",   name: "Target Corp.",           sector: "Consumer Staples",   exchange: "NYSE"   },
  { symbol: "PG",    name: "Procter & Gamble",       sector: "Consumer Staples",   exchange: "NYSE"   },
  { symbol: "KO",    name: "Coca-Cola Co.",          sector: "Consumer Staples",   exchange: "NYSE"   },

  // Financials
  { symbol: "JPM",   name: "JPMorgan Chase",         sector: "Financials",    exchange: "NYSE"   },
  { symbol: "BAC",   name: "Bank of America",        sector: "Financials",    exchange: "NYSE"   },
  { symbol: "WFC",   name: "Wells Fargo",            sector: "Financials",    exchange: "NYSE"   },
  { symbol: "GS",    name: "Goldman Sachs",          sector: "Financials",    exchange: "NYSE"   },
  { symbol: "MS",    name: "Morgan Stanley",         sector: "Financials",    exchange: "NYSE"   },
  { symbol: "V",     name: "Visa Inc.",              sector: "Financials",    exchange: "NYSE"   },
  { symbol: "MA",    name: "Mastercard Inc.",        sector: "Financials",    exchange: "NYSE"   },
  { symbol: "PYPL",  name: "PayPal Holdings",        sector: "Financials",    exchange: "NASDAQ" },
  { symbol: "BLK",   name: "BlackRock Inc.",         sector: "Financials",    exchange: "NYSE"   },
  { symbol: "COIN",  name: "Coinbase Global",        sector: "Financials",    exchange: "NASDAQ" },

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

  // Industrials
  { symbol: "RKLB",  name: "Rocket Lab USA, Inc.",   sector: "Industrials", exchange: "NASDAQ" },
  { symbol: "CAT",   name: "Caterpillar Inc.",       sector: "Industrials", exchange: "NYSE"   },
  { symbol: "GE",    name: "General Electric",       sector: "Industrials", exchange: "NYSE"   },
  { symbol: "UPS",   name: "United Parcel Service",  sector: "Industrials", exchange: "NYSE"   },

  // Utilities
  { symbol: "NEE",   name: "NextEra Energy",         sector: "Utilities",  exchange: "NYSE"   },
  { symbol: "DUK",   name: "Duke Energy Corp.",      sector: "Utilities",  exchange: "NYSE"   },

  // Materials
  { symbol: "LIN",   name: "Linde plc",              sector: "Materials",  exchange: "NYSE"   },
  { symbol: "SHW",   name: "Sherwin-Williams Co.",   sector: "Materials",  exchange: "NYSE"   },

  // Real Estate
  { symbol: "AMT",   name: "American Tower Corp.",   sector: "Real Estate", exchange: "NYSE"   },
  { symbol: "PLD",   name: "Prologis Inc.",          sector: "Real Estate", exchange: "NYSE"   },

  // Index / ETF
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",      sector: "Index / ETF", exchange: "NYSE"   },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",      sector: "Index / ETF", exchange: "NASDAQ" },
  { symbol: "IWM",   name: "iShares Russell 2000",   sector: "Index / ETF", exchange: "NYSE"   },
  { symbol: "DIA",   name: "SPDR Dow Jones ETF",     sector: "Index / ETF", exchange: "NYSE"   },
  { symbol: "SPCX",  name: "Spectra ESG ETF",        sector: "Index / ETF", exchange: "NASDAQ" },
];

/**
 * Returns the correct TradingView prefix symbol (e.g. NYSE:JPM, NASDAQ:AAPL)
 * Note: Forced to use BATS exchange to bypass TradingView's 15-minute delay for free widgets.
 */
export function getTradingViewSymbol(symbol: string): string {
  if (!symbol) return "";
  const upperSymbol = symbol.toUpperCase();
  if (upperSymbol.includes(":")) {
    return upperSymbol;
  }

  // Special Commodities / Forex / Crypto mappings
  if (
    upperSymbol === "XAUUSD" ||
    upperSymbol === "GOLD" ||
    upperSymbol === "XAUSD" ||
    upperSymbol === "XAAUSD" ||
    upperSymbol === "TVCGOLD"
  ) {
    // Let TradingView auto-resolve the best real-time spot gold (usually FX_IDC or OANDA)
    return "XAUUSD";
  }
  if (upperSymbol === "BTC" || upperSymbol === "BTCUSD") {
    return "COINBASE:BTCUSD";
  }
  if (upperSymbol === "ETH" || upperSymbol === "ETHUSD") {
    return "COINBASE:ETHUSD";
  }
  if (upperSymbol === "SOL" || upperSymbol === "SOLUSD") {
    return "COINBASE:SOLUSD";
  }
  if (upperSymbol === "USDT" || upperSymbol === "USDTUSD") {
    return "KRAKEN:USDTUSD";
  }

  const stock = US_STOCKS.find((s) => s.symbol.toUpperCase() === upperSymbol);
  if (stock) {
    if (stock.exchange === "TVC" || stock.exchange === "OANDA") {
      return stock.symbol;
    }
    // Override native exchange with BATS to get free real-time data on TradingView widgets
    return `BATS:${stock.symbol}`;
  }
  // Default fallback to auto-resolve
  return symbol;
}
