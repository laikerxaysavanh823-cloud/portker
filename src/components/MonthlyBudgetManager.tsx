import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import { formatCurrency, formatMonthLabel } from '../utils/formatters';
import { downloadCSVReport, printMonthlyReport } from '../utils/exportUtils';
import {
  DollarSign,
  TrendingUp,
  Coins,
  ShieldCheck,
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  PieChart,
  ArrowRightLeft,
  Sparkles,
  Layers,
  ShoppingBag,
  FileSpreadsheet,
  Printer,
  Download,
} from 'lucide-react';

interface MonthlyBudgetManagerProps {
  onOpenExpenseModal: () => void;
  onOpenInvestmentModal: () => void;
  onOpenDataSync?: () => void;
}

export const MonthlyBudgetManager: React.FC<MonthlyBudgetManagerProps> = ({
  onOpenExpenseModal,
  onOpenInvestmentModal,
  onOpenDataSync,
}) => {
  const {
    state,
    currentMonthData,
    monthlySummary,
    updateMonthIncome,
    updateMonthAllocations,
    deleteExpense,
    deleteInvestment,
  } = useApp();

  const t = TRANSLATIONS[state.language] || TRANSLATIONS.lo;
  const rateUsdLak = state.rates.usdLak;

  // Editing state for monthly income and allocation percentages
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editIncome, setEditIncome] = useState(currentMonthData.incomeLak.toString());
  const [allocState, setAllocState] = useState({ ...currentMonthData.allocations });

  // Sync edit states when selected month changes
  React.useEffect(() => {
    setEditIncome(currentMonthData.incomeLak.toString());
    setAllocState({ ...currentMonthData.allocations });
    setIsEditingBudget(false);
  }, [currentMonthData]);

  const handleIncomeChange = (valStr: string) => {
    setEditIncome(valStr);
    const num = parseFloat(valStr) || 0;
    if (num > 0) {
      // Recalculate amounts based on existing percentages
      setAllocState((prev) => ({
        ...prev,
        foodLivingLak: num * (prev.foodLivingPct / 100),
        usStocksUsd: (num * (prev.usStocksPct / 100)) / rateUsdLak,
        fundsEtfsUsd: (num * (prev.fundsEtfsPct / 100)) / rateUsdLak,
        bitcoinUsd: (num * (prev.bitcoinPct / 100)) / rateUsdLak,
        goldUsd: (num * (prev.goldPct / 100)) / rateUsdLak,
        emergencyLak: num * (prev.emergencyPct / 100),
        savingsLeisureLak: num * (prev.savingsLeisurePct / 100),
      }));
    } else {
      setAllocState((prev) => ({
        ...prev,
        foodLivingLak: 0,
        usStocksUsd: 0,
        fundsEtfsUsd: 0,
        bitcoinUsd: 0,
        goldUsd: 0,
        emergencyLak: 0,
        savingsLeisureLak: 0,
      }));
    }
  };

  const handlePctChange = (key: string, newPctStr: string) => {
    const newPct = parseFloat(newPctStr) || 0;
    const income = parseFloat(editIncome) || 0;

    setAllocState((prev) => {
      const updated = { ...prev };
      if (key === 'food') {
        updated.foodLivingPct = newPct;
        updated.foodLivingLak = income * (newPct / 100);
      } else if (key === 'stocks') {
        updated.usStocksPct = newPct;
        updated.usStocksUsd = (income * (newPct / 100)) / rateUsdLak;
      } else if (key === 'funds') {
        updated.fundsEtfsPct = newPct;
        updated.fundsEtfsUsd = (income * (newPct / 100)) / rateUsdLak;
      } else if (key === 'btc') {
        updated.bitcoinPct = newPct;
        updated.bitcoinUsd = (income * (newPct / 100)) / rateUsdLak;
      } else if (key === 'gold') {
        updated.goldPct = newPct;
        updated.goldUsd = (income * (newPct / 100)) / rateUsdLak;
      } else if (key === 'emergency') {
        updated.emergencyPct = newPct;
        updated.emergencyLak = income * (newPct / 100);
      } else if (key === 'leisure') {
        updated.savingsLeisurePct = newPct;
        updated.savingsLeisureLak = income * (newPct / 100);
      }
      return updated;
    });
  };

  const handleAmountChange = (key: string, newAmountStr: string) => {
    const newAmount = parseFloat(newAmountStr) || 0;
    const income = parseFloat(editIncome) || 1;

    setAllocState((prev) => {
      const updated = { ...prev };
      if (key === 'food') {
        updated.foodLivingLak = newAmount;
        updated.foodLivingPct = (newAmount / income) * 100;
      } else if (key === 'stocks') {
        updated.usStocksUsd = newAmount;
        updated.usStocksPct = ((newAmount * rateUsdLak) / income) * 100;
      } else if (key === 'funds') {
        updated.fundsEtfsUsd = newAmount;
        updated.fundsEtfsPct = ((newAmount * rateUsdLak) / income) * 100;
      } else if (key === 'btc') {
        updated.bitcoinUsd = newAmount;
        updated.bitcoinPct = ((newAmount * rateUsdLak) / income) * 100;
      } else if (key === 'gold') {
        updated.goldUsd = newAmount;
        updated.goldPct = ((newAmount * rateUsdLak) / income) * 100;
      } else if (key === 'emergency') {
        updated.emergencyLak = newAmount;
        updated.emergencyPct = (newAmount / income) * 100;
      } else if (key === 'leisure') {
        updated.savingsLeisureLak = newAmount;
        updated.savingsLeisurePct = (newAmount / income) * 100;
      }
      return updated;
    });
  };

  const totalPct =
    (allocState.foodLivingPct || 0) +
    (allocState.usStocksPct || 0) +
    (allocState.fundsEtfsPct || 0) +
    (allocState.bitcoinPct || 0) +
    (allocState.goldPct || 0) +
    (allocState.emergencyPct || 0) +
    (allocState.savingsLeisurePct || 0);

  const saveBudgetChanges = () => {
    const inc = parseFloat(editIncome) || 0;
    updateMonthIncome(currentMonthData.monthKey, inc);
    updateMonthAllocations(currentMonthData.monthKey, allocState);
    setIsEditingBudget(false);
  };

  // Group actuals for comparison
  const actualLivingExpenses = (currentMonthData.expenses || []).reduce(
    (acc, e) => acc + e.amountLak,
    0
  );

  const actualStocksUsd = (currentMonthData.investments || [])
    .filter((i) => i.assetType === 'stock')
    .reduce((acc, i) => acc + i.amountUsd, 0);

  const actualFundsUsd = (currentMonthData.investments || [])
    .filter((i) => i.assetType === 'etf')
    .reduce((acc, i) => acc + i.amountUsd, 0);

  const actualBtcUsd = (currentMonthData.investments || [])
    .filter((i) => i.assetType === 'btc')
    .reduce((acc, i) => acc + i.amountUsd, 0);

  const actualGoldUsd = (currentMonthData.investments || [])
    .filter((i) => i.assetType === 'gold')
    .reduce((acc, i) => acc + i.amountUsd, 0);

  return (
    <div className="space-y-6">
      
      {/* Month Header & Income Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">
                {formatMonthLabel(currentMonthData.monthKey, state.language)}
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {t.budgetAllocation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {state.language === 'lo'
                ? 'ກຳນົດລາຍຮັບເປັນເງິນກີບ (₭) ແລະ ຈັດສັນລົງທຶນຮຸ້ນ, ກອງທຶນ, ບິດຄອຍເປັນດອນລ່າ ($)'
                : 'กำหนดรายรับเป็นเงินกีบ (₭) และจัดสรรลงทุนหุ้น, กองทุน, บิตคอยน์เป็นดอลลาร์ ($)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Export / Print Actions */}
            <button
              onClick={() => downloadCSVReport(state)}
              title="ດາວໂຫຼດ Excel / CSV"
              className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-emerald-800/40 hover:border-emerald-500 px-3 py-2 rounded-xl text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel/CSV</span>
            </button>

            <button
              onClick={() => printMonthlyReport(currentMonthData.monthKey, state)}
              title="ພິມ / ບັນທຶກເປັນ PDF"
              className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-blue-400 border border-blue-800/40 hover:border-blue-500 px-3 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            {onOpenDataSync && (
              <button
                onClick={onOpenDataSync}
                title="ບັນທຶກຟາຍ & ໃຊ້ຮ່ວມກັນ (PC + ມືຖື)"
                className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-800/40 hover:border-amber-500 px-3 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{state.language === 'lo' ? 'Sync/ແບ່ງປັນ' : 'Sync/แชร์'}</span>
              </button>
            )}

            {!isEditingBudget ? (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-amber-300 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{state.language === 'lo' ? 'ປັບແຕ່ງງົບປະມານ' : 'ปรับแต่งงบประมาณ'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={saveBudgetChanges}
                  className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.save}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Income Card & Progress Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          
          {/* Income Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              {t.incomeInKip}
            </div>
            {isEditingBudget ? (
              <div className="space-y-1.5">
                <input
                  type="number"
                  value={editIncome}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/60 rounded-lg px-3 py-1.5 text-lg font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="25000000"
                />
                <div className="text-[11px] font-mono text-slate-400">
                  ≈ ${((parseFloat(editIncome) || 0) / rateUsdLak).toFixed(2)} USD (@ ₭{rateUsdLak.toLocaleString()})
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  {formatCurrency(currentMonthData.incomeLak, 'LAK')}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  ≈ ${(currentMonthData.incomeLak / rateUsdLak).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  USD
                </div>
              </div>
            )}
          </div>

          {/* Planned vs Actual Investment in USD & LAK */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{state.language === 'lo' ? 'ລົງທຶນຮຸ້ນ + ກອງທຶນ + BTC' : 'ลงทุนหุ้น + กองทุน + BTC'}</span>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded">USD → LAK</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${monthlySummary.actualInvestmentsUsd.toFixed(1)} / ${monthlySummary.plannedInvestmentsUsd.toFixed(0)} USD
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              ≈ ₭{monthlySummary.actualInvestmentsLak.toLocaleString()} (ແຜນ ₭{monthlySummary.plannedInvestmentsLak.toLocaleString()})
            </div>
          </div>

          {/* Budget Remaining */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              {state.language === 'lo' ? 'ຍັງເຫຼືອໃຊ້ຈ່າຍ & ອອມ' : 'คงเหลือใช้จ่าย & ออม'}
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                monthlySummary.remainingBudgetLak >= 0 ? 'text-blue-300' : 'text-red-400'
              }`}
            >
              {formatCurrency(monthlySummary.remainingBudgetLak, 'LAK')}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <span>
                {state.language === 'lo' ? 'ອັດຕາການອອມ & ລົງທຶນ:' : 'อัตราออม & ลงทุน:'}
              </span>
              <strong className="text-emerald-400 font-mono">
                {monthlySummary.savingsRatePct.toFixed(1)}%
              </strong>
            </div>
          </div>

        </div>

        {/* Preset strategy buttons & warning if allocation % != 100 during editing */}
        {isEditingBudget ? (
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-400">
                {state.language === 'lo' ? 'ເລືອກສູດສັດສ່ວນດ່ວນ:' : 'เลือกสูตรสัดส่วนด่วน:'}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const inc = parseFloat(editIncome) || currentMonthData.incomeLak || 25000000;
                    setAllocState({
                      foodLivingPct: 15,
                      foodLivingLak: inc * 0.15,
                      usStocksPct: 15,
                      usStocksUsd: (inc * 0.15) / rateUsdLak,
                      fundsEtfsPct: 20,
                      fundsEtfsUsd: (inc * 0.20) / rateUsdLak,
                      bitcoinPct: 15,
                      bitcoinUsd: (inc * 0.15) / rateUsdLak,
                      goldPct: 25,
                      goldUsd: (inc * 0.25) / rateUsdLak,
                      emergencyPct: 10,
                      emergencyLak: inc * 0.10,
                      savingsLeisurePct: 0,
                      savingsLeisureLak: 0,
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
                >
                  ⭐ {state.language === 'lo' ? 'ສູດ 15/35/15/10/25' : 'สูตร 15/35/15/10/25'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const inc = parseFloat(editIncome) || currentMonthData.incomeLak || 25000000;
                    setAllocState({
                      foodLivingPct: 50,
                      foodLivingLak: inc * 0.50,
                      usStocksPct: 10,
                      usStocksUsd: (inc * 0.10) / rateUsdLak,
                      fundsEtfsPct: 10,
                      fundsEtfsUsd: (inc * 0.10) / rateUsdLak,
                      bitcoinPct: 5,
                      bitcoinUsd: (inc * 0.05) / rateUsdLak,
                      goldPct: 5,
                      goldUsd: (inc * 0.05) / rateUsdLak,
                      emergencyPct: 10,
                      emergencyLak: inc * 0.10,
                      savingsLeisurePct: 10,
                      savingsLeisureLak: inc * 0.10,
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                >
                  50/30/20 Rule
                </button>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                Math.abs(totalPct - 100) < 0.1
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  {state.language === 'lo'
                    ? `ສັດສ່ວນລວມປັດຈຸບັນ: ${totalPct.toFixed(1)}% (ຄວນເທົ່າກັບ 100%)`
                    : `สัดส่วนรวมปัจจุบัน: ${totalPct.toFixed(1)}% (ควรเท่ากับ 100%)`}
                </span>
              </div>
              <button
                onClick={() => {
                  const diff = 100 - (totalPct - (allocState.savingsLeisurePct || 0));
                  if (diff >= 0) {
                    handlePctChange('leisure', diff.toFixed(1));
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700"
              >
                {state.language === 'lo' ? 'ປັບໃຫ້ຄົບ 100% ອັດຕະໂນມັດ' : 'ปรับให้ครบ 100% อัตโนมัติ'}
              </button>
            </div>
          </div>
        ) : (
          /* Active Formula Summary Pill Bar */
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{state.language === 'lo' ? 'ສັດສ່ວນແຜນປັດຈຸບັນ:' : 'สัดส่วนแผนปัจจุบัน:'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/50 text-blue-300">
                🍽️ ຊື້ກິນ {currentMonthData.allocations.foodLivingPct.toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-300">
                📈 ຫຸ້ນ+ກອງທຶນ {(currentMonthData.allocations.usStocksPct + currentMonthData.allocations.fundsEtfsPct).toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-800/50 text-orange-300">
                🪙 ບິດຄອຍ {currentMonthData.allocations.bitcoinPct.toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/50 text-purple-300">
                🛡️ ສຸກເສີນ {currentMonthData.allocations.emergencyPct.toFixed(0)}%
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/50 text-amber-300 font-bold">
                🥇 ຄຳ {currentMonthData.allocations.goldPct.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Allocation Breakdown Table: Dual Currency USD & LAK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>{t.budgetAllocation}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t.investInUsdBadge}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 font-medium transition"
            >
              <Utensils className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.addExpense}</span>
            </button>

            <button
              onClick={onOpenInvestmentModal}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs px-3.5 py-1.5 rounded-xl font-bold shadow-md shadow-amber-500/20 transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-slate-950" />
              <span>{t.addInvestment}</span>
            </button>
          </div>
        </div>

        {/* Allocation Rows */}
        <div className="space-y-3">
          
          {/* 1. Living & Food (LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.foodLiving}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                      LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {state.language === 'lo' ? 'ຄ່າອາຫານ, ຄ່ານ້ຳ-ໄຟ, ຄ່ານ້ຳມັນ' : 'ค่าอาหาร, น้ำ-ไฟ, เดินทาง'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.foodLivingPct.toFixed(1)}
                      onChange={(e) => handlePctChange('food', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.foodLivingLak}
                      onChange={(e) => handleAmountChange('food', e.target.value)}
                      className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">₭</span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-slate-100">
                      {formatCurrency(currentMonthData.allocations.foodLivingLak, 'LAK')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {currentMonthData.allocations.foodLivingPct.toFixed(1)}% {t.pctOfIncome}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actual Spend Progress Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {t.actual}: <strong className="text-blue-400 font-mono">₭{actualLivingExpenses.toLocaleString()}</strong>
              </span>
              <span className="text-slate-400">
                {t.remaining}:{' '}
                <strong className={`font-mono ${currentMonthData.allocations.foodLivingLak - actualLivingExpenses >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₭{(currentMonthData.allocations.foodLivingLak - actualLivingExpenses).toLocaleString()}
                </strong>
              </span>
            </div>
          </div>

          {/* 2. US Stocks (USD -> LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.usStocksInvest}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      USD $ → LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    NVDA, AAPL, MSFT, TSLA, etc.
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.usStocksPct.toFixed(1)}
                      onChange={(e) => handlePctChange('stocks', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.usStocksUsd}
                      onChange={(e) => handleAmountChange('stocks', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-emerald-400 font-mono">$</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (≈ ₭{(allocState.usStocksUsd * rateUsdLak).toLocaleString()})
                    </span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-emerald-400">
                      ${currentMonthData.allocations.usStocksUsd.toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-400">
                      ≈ ₭{(currentMonthData.allocations.usStocksUsd * rateUsdLak).toLocaleString()} ({currentMonthData.allocations.usStocksPct.toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {t.actual}: <strong className="text-emerald-400 font-mono">${actualStocksUsd.toFixed(2)} USD</strong>{' '}
                <span className="text-slate-400 font-mono">(≈ ₭{(actualStocksUsd * rateUsdLak).toLocaleString()})</span>
              </span>
              <span className="text-slate-400">
                {t.remaining}:{' '}
                <strong className={`font-mono ${currentMonthData.allocations.usStocksUsd - actualStocksUsd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${(currentMonthData.allocations.usStocksUsd - actualStocksUsd).toFixed(2)} USD
                </strong>
              </span>
            </div>
          </div>

          {/* 3. Mutual Funds & ETFs (USD -> LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.fundsInvest}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/40">
                      USD $ → LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    VOO, QQQ, SPY, VT, etc.
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.fundsEtfsPct.toFixed(1)}
                      onChange={(e) => handlePctChange('funds', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.fundsEtfsUsd}
                      onChange={(e) => handleAmountChange('funds', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-teal-400 font-mono">$</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (≈ ₭{(allocState.fundsEtfsUsd * rateUsdLak).toLocaleString()})
                    </span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-teal-400">
                      ${currentMonthData.allocations.fundsEtfsUsd.toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-400">
                      ≈ ₭{(currentMonthData.allocations.fundsEtfsUsd * rateUsdLak).toLocaleString()} ({currentMonthData.allocations.fundsEtfsPct.toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {t.actual}: <strong className="text-teal-400 font-mono">${actualFundsUsd.toFixed(2)} USD</strong>{' '}
                <span className="text-slate-400 font-mono">(≈ ₭{(actualFundsUsd * rateUsdLak).toLocaleString()})</span>
              </span>
              <span className="text-slate-400">
                {t.remaining}:{' '}
                <strong className={`font-mono ${currentMonthData.allocations.fundsEtfsUsd - actualFundsUsd >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  ${(currentMonthData.allocations.fundsEtfsUsd - actualFundsUsd).toFixed(2)} USD
                </strong>
              </span>
            </div>
          </div>

          {/* 4. Bitcoin (BTC DCA) (USD -> LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-orange-950/80 border border-orange-800/50 flex items-center justify-center text-orange-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.btcInvest}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800/40">
                      USD $ → LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Bitcoin DCA Accumulation
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.bitcoinPct.toFixed(1)}
                      onChange={(e) => handlePctChange('btc', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.bitcoinUsd}
                      onChange={(e) => handleAmountChange('btc', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-orange-400 font-mono">$</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (≈ ₭{(allocState.bitcoinUsd * rateUsdLak).toLocaleString()})
                    </span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-orange-400">
                      ${currentMonthData.allocations.bitcoinUsd.toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-400">
                      ≈ ₭{(currentMonthData.allocations.bitcoinUsd * rateUsdLak).toLocaleString()} ({currentMonthData.allocations.bitcoinPct.toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {t.actual}: <strong className="text-orange-400 font-mono">${actualBtcUsd.toFixed(2)} USD</strong>{' '}
                <span className="text-slate-400 font-mono">(≈ ₭{(actualBtcUsd * rateUsdLak).toLocaleString()})</span>
              </span>
              <span className="text-slate-400">
                {t.remaining}:{' '}
                <strong className={`font-mono ${currentMonthData.allocations.bitcoinUsd - actualBtcUsd >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                  ${(currentMonthData.allocations.bitcoinUsd - actualBtcUsd).toFixed(2)} USD
                </strong>
              </span>
            </div>
          </div>

          {/* 5. Gold (USD / LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.goldInvest}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                      USD / LAK
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Physical Gold / Gold Grams
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.goldPct.toFixed(1)}
                      onChange={(e) => handlePctChange('gold', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.goldUsd}
                      onChange={(e) => handleAmountChange('gold', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-slate-200"
                    />
                    <span className="text-xs text-amber-400 font-mono">$</span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-amber-300">
                      ${currentMonthData.allocations.goldUsd.toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-400">
                      ≈ ₭{(currentMonthData.allocations.goldUsd * rateUsdLak).toLocaleString()} ({currentMonthData.allocations.goldPct.toFixed(1)}%)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. Emergency Fund (10% LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.emergencySavings}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/40">
                      10% • LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {state.language === 'lo' ? 'ເງິນສຳຮອງສຸກເສີນ (3-6 ເດືອນ)' : 'เงินสำรองฉุกเฉิน (3-6 เดือน)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.emergencyPct.toFixed(1)}
                      onChange={(e) => handlePctChange('emergency', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-purple-300 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.emergencyLak}
                      onChange={(e) => handleAmountChange('emergency', e.target.value)}
                      className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-purple-300 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-mono">₭</span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-purple-300">
                      {formatCurrency(currentMonthData.allocations.emergencyLak, 'LAK')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {currentMonthData.allocations.emergencyPct.toFixed(1)}% {t.pctOfIncome}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {state.language === 'lo' ? 'ເປົ້າໝາຍອອມເດືອນນີ້' : 'เป้าหมายออมเดือนนี้'}: <strong className="text-purple-300 font-mono">{formatCurrency(currentMonthData.allocations.emergencyLak, 'LAK')}</strong>
              </span>
              <span className="text-purple-400 text-xs font-mono">
                🛡️ {currentMonthData.allocations.emergencyPct.toFixed(0)}% Safety Allocation
              </span>
            </div>
          </div>

          {/* 7. Leisure & Free Savings (LAK) */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 transition hover:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <span>{t.leisureSavings}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                      LAK ₭
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {state.language === 'lo' ? 'ເງິນອອມອິດສະຫຼະ, ທ່ອງທ່ຽວ, ຂອງຂວັນ' : 'เงินออมอิสระ, ท่องเที่ยว, ของขวัญ'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEditingBudget ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={allocState.savingsLeisurePct.toFixed(1)}
                      onChange={(e) => handlePctChange('leisure', e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-indigo-300 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-mono">%</span>
                    <input
                      type="number"
                      value={allocState.savingsLeisureLak}
                      onChange={(e) => handleAmountChange('leisure', e.target.value)}
                      className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-right text-indigo-300 font-bold"
                    />
                    <span className="text-xs text-slate-400 font-mono">₭</span>
                  </div>
                ) : (
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-indigo-300">
                      {formatCurrency(currentMonthData.allocations.savingsLeisureLak, 'LAK')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {currentMonthData.allocations.savingsLeisurePct.toFixed(1)}% {t.pctOfIncome}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Monthly Activity Log: Expenses & Investments Recorded this Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Living Expenses Recorded (LAK) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-blue-400" />
              <span>
                {state.language === 'lo' ? 'ລາຍຈ່າຍທີ່ບັນທຶກເດືອນນີ້' : 'รายจ่ายที่บันทึกเดือนนี้'}
              </span>
            </h3>
            <button
              onClick={onOpenExpenseModal}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              + {state.language === 'lo' ? 'ບັນທຶກລາຍຈ່າຍ' : 'บันทึกรายจ่าย'}
            </button>
          </div>

          {(currentMonthData.expenses || []).length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              {state.language === 'lo'
                ? 'ຍັງບໍ່ມີລາຍຈ່າຍທີ່ບັນທຶກໃນເດືອນນີ້'
                : 'ยังไม่มีรายจ่ายที่บันทึกในเดือนนี้'}
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentMonthData.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">{exp.category}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{exp.date}</span>
                      {exp.note && <span>• {exp.note}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-slate-200">
                      -₭{exp.amountLak.toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteExpense(currentMonthData.monthKey, exp.id)}
                      className="text-slate-600 hover:text-red-400 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Investment Purchases Recorded (USD -> LAK) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                {state.language === 'lo' ? 'ການລົງທຶນທີ່ບັນທຶກເດືອນນີ້' : 'การลงทุนที่บันทึกเดือนนี้'}
              </span>
            </h3>
            <button
              onClick={onOpenInvestmentModal}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              + {state.language === 'lo' ? 'ບັນທຶກການລົງທຶນ' : 'บันทึกการลงทุน'}
            </button>
          </div>

          {(currentMonthData.investments || []).length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              {state.language === 'lo'
                ? 'ຍັງບໍ່ມີການລົງທຶນທີ່ບັນທຶກໃນເດືອນນີ້'
                : 'ยังไม่มีการลงทุนที่บันทึกในเดือนนี้'}
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentMonthData.investments.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-1.5">
                      <span>{inv.assetName}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-amber-400">
                        {inv.assetType.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{inv.date}</span>
                      {inv.sharesOrUnits && (
                        <span>• {inv.sharesOrUnits} units @ ${inv.unitPriceUsd}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="font-mono font-bold text-emerald-400">
                        ${inv.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        ≈ ₭{inv.amountLak.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteInvestment(currentMonthData.monthKey, inv.id)}
                      className="text-slate-600 hover:text-red-400 transition ml-2"
                      title="Delete investment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
