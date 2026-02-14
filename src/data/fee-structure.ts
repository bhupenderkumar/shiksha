// Fee Structure Data — Session 2026-27
// Clean chart-style data matching the fee chart image format

export interface FeeChartRow {
  className: string;
  regFee: number;          // Registration fee (one-time)
  monthlyFee: number;
  monthsInYear: number;    // Typically 12
  admissionPackage: number; // Books, Uniform, Stationery, ID Card, Diary
  extraSummerDress: number;
  winterDress: number;
  copies: number;          // Classwork & Homework copies
  seatStatus: 'available' | 'limited' | 'full';
}

export interface PromotionChartRow {
  fromClass: string;
  toClass: string;
  promotionPackage: number; // Books, Uniform, Stationery, ID Card, Diary
  copies: number;
  monthlyFee: number;
  monthsInYear: number;
}

// ── Fee Chart Data ──────────────────────────────────────────────────────

export const feeChartData: FeeChartRow[] = [
  { className: 'Nursery',  regFee: 0, monthlyFee: 700,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'LKG',      regFee: 0, monthlyFee: 700,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'UKG',      regFee: 0, monthlyFee: 700,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 1',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 2',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 3',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'full' },
  { className: 'Class 4',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 5',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'full' },
  { className: 'Class 6',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 7',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
  { className: 'Class 8',  regFee: 0, monthlyFee: 780,  monthsInYear: 12, admissionPackage: 3700, extraSummerDress: 700, winterDress: 1000, copies: 300, seatStatus: 'available' },
];

// ── Promotion Chart Data ────────────────────────────────────────────────

export const promotionChartData: PromotionChartRow[] = [
  { fromClass: 'Nursery',  toClass: 'LKG',     promotionPackage: 3700, copies: 300, monthlyFee: 700, monthsInYear: 12 },
  { fromClass: 'LKG',      toClass: 'UKG',     promotionPackage: 3700, copies: 300, monthlyFee: 700, monthsInYear: 12 },
  { fromClass: 'UKG',      toClass: 'Class 1', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 1',  toClass: 'Class 2', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 2',  toClass: 'Class 3', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 3',  toClass: 'Class 4', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 4',  toClass: 'Class 5', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 5',  toClass: 'Class 6', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 6',  toClass: 'Class 7', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
  { fromClass: 'Class 7',  toClass: 'Class 8', promotionPackage: 3700, copies: 300, monthlyFee: 780, monthsInYear: 12 },
];

// ── Computed Helpers ────────────────────────────────────────────────────

export function getAdmissionTotal(row: FeeChartRow): number {
  return row.admissionPackage + row.extraSummerDress + row.winterDress + row.copies;
}

export function getMonthlyTotal(row: FeeChartRow): number {
  return row.monthlyFee * row.monthsInYear;
}

export function getTotalAtAdmission(row: FeeChartRow): number {
  return getAdmissionTotal(row);
}

export function getTotalFeeInYear(row: FeeChartRow): number {
  return getAdmissionTotal(row) + getMonthlyTotal(row);
}

export function getPromotionTotal(row: PromotionChartRow): number {
  return row.promotionPackage + row.copies;
}

export function getPromotionYearTotal(row: PromotionChartRow): number {
  return getPromotionTotal(row) + (row.monthlyFee * row.monthsInYear);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNum(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}
