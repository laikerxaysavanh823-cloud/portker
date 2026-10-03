export type NavTab =
  | 'budget'
  | 'portfolio'
  | 'stocks'
  | 'funds'
  | 'crypto'
  | 'gold'
  | 'emergency'
  | 'analytics';

export type Currency = 'LAK' | 'USD' | 'THB';
export type Language = 'lo' | 'th' | 'en';

export interface MarketRates {
  usdLak: number; // 1 USD in LAK (e.g., 22500)
  usdThb: number; // 1 USD in THB (e.g., 34.5)
  btcUsd: number; // 1 BTC in USD (e.g., 78000)
  goldUsdPerGram: number; // Gold per gram in USD (e.g., 85.5)
  lastUpdated: string;
  sourceName?: string;
}

export interface StockHolding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgCostUsd: number;
  currentPriceUsd: number;
  lastUpdated?: string;
  notes?: string;
}

export interface FundHolding {
  id: string;
  ticker: string;
  name: string;
  units: number;
  avgCostUsd: number;
  currentPriceUsd: number;
  category?: 'index_etf' | 'tech_etf' | 'dividend' | 'bond' | 'other';
  notes?: string;
}

export interface BtcTransaction {
  id: string;
  date: string;
  type: 'buy' | 'sell';
  btcAmount: number;
  priceUsd: number;
  totalUsd: number;
  totalLak: number;
  fundingSource: 'monthly_budget' | 'lak_cash' | 'usd_cash' | 'external';
  note?: string;
}

export interface BtcHolding {
  amountBtc: number;
  avgCostUsd: number;
  transactions: BtcTransaction[];
}

export interface GoldHolding {
  grams: number;
  avgCostUsdPerGram: number;
  notes?: string;
}

export interface EmergencyFund {
  balanceLak: number;
  targetMonths: number;
  monthlyExpenseLak: number;
}

export interface CashHolding {
  balanceLak: number;
  balanceUsd: number;
}

export interface MonthlyAllocation {
  categoryKey: string;
  nameLo: string;
  nameTh: string;
  nameEn: string;
  currency: 'LAK' | 'USD';
  plannedAmount: number; // in its native currency (e.g., USD for stocks/funds/btc, LAK for food/emergency)
  percentageOfIncome: number; // % of total monthly income
  color: string;
  iconName: string;
}

export interface MonthlyExpense {
  id: string;
  date: string;
  category: string;
  amountLak: number;
  note?: string;
}

export interface MonthlyInvestment {
  id: string;
  date: string;
  assetType: 'stock' | 'etf' | 'btc' | 'gold' | 'emergency';
  assetName: string;
  amountUsd: number; // recorded in USD for stocks, etfs, btc
  amountLak: number; // auto-converted to LAK
  rateUsed: number; // USD to LAK exchange rate at transaction time
  sharesOrUnits?: number;
  unitPriceUsd?: number;
  note?: string;
}

export interface MonthData {
  monthKey: string; // 'YYYY-MM', e.g., '2026-08'
  title?: string;
  incomeLak: number; // Monthly income in Lao Kip
  incomeUsdEquivalent?: number;
  allocations: {
    foodLivingLak: number; // LAK
    foodLivingPct: number;
    usStocksUsd: number; // USD
    usStocksPct: number;
    fundsEtfsUsd: number; // USD
    fundsEtfsPct: number;
    bitcoinUsd: number; // USD
    bitcoinPct: number;
    goldUsd: number; // USD (or LAK equivalent)
    goldPct: number;
    emergencyLak: number; // LAK
    emergencyPct: number;
    savingsLeisureLak: number; // LAK
    savingsLeisurePct: number;
  };
  expenses: MonthlyExpense[];
  investments: MonthlyInvestment[];
  savingsDepositedLak: number;
  notes?: string;
}

export interface AppState {
  version: number;
  language: Language;
  primaryCurrency: Currency;
  rates: MarketRates;
  selectedMonth: string; // '2026-08'
  months: Record<string, MonthData>;
  holdings: {
    stocks: StockHolding[];
    etfs: FundHolding[];
    btc: BtcHolding;
    gold: GoldHolding;
    emergency: EmergencyFund;
    cash: CashHolding;
  };
}
