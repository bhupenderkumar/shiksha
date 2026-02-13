// Fee Structure Data — Session 2026-27

export interface FeeItem {
  name: string;
  amount: number;
  note?: string;
}

export interface ClassFeeStructure {
  className: string;
  admissionFees: FeeItem[];
  monthlyFees: FeeItem[];
  additionalCharges: FeeItem[];
  seatStatus: 'available' | 'limited' | 'full';
  seatsRemaining?: number;
}

export interface PromotionChargeItem {
  name: string;
  amount: number;
  note?: string;
  optional?: boolean;
}

export interface ClassPromotionCharges {
  className: string;
  fromClass: string;
  toClass: string;
  charges: PromotionChargeItem[];
}

// ── Helper to build a class entry ────────────────────────────────────────

function buildClass(
  className: string,
  monthlyFee: number,
  seatStatus: ClassFeeStructure['seatStatus'] = 'available',
): ClassFeeStructure {
  return {
    className,
    seatStatus,
    admissionFees: [
      { name: 'Admission Package', amount: 3700, note: 'Includes Books, 1 Uniform, Full-Year Stationery, ID Card & Diary' },
      { name: 'Extra Summer Dress', amount: 700 },
      { name: 'Winter Dress', amount: 1000 },
      { name: 'Classwork & Homework Copies', amount: 300 },
    ],
    monthlyFees: [
      { name: 'Monthly Fee', amount: monthlyFee },
    ],
    additionalCharges: [],
  };
}

// ── Admission Fee Structure ──────────────────────────────────────────────

export const admissionFeeStructure: ClassFeeStructure[] = [
  // Pre-Primary (₹700/month)
  buildClass('Nursery', 700),
  buildClass('LKG', 700),
  buildClass('UKG', 700),
  // Primary & above (₹780/month)
  buildClass('Class 1', 780),
  buildClass('Class 2', 780),
  buildClass('Class 3', 780, 'full'),
  buildClass('Class 4', 780),
  buildClass('Class 5', 780, 'full'),
  buildClass('Class 6', 780),
  buildClass('Class 7', 780),
  buildClass('Class 8', 780),
];

// ── Promotion Charges ────────────────────────────────────────────────────

function buildPromotion(fromClass: string, toClass: string, classFee: number): ClassPromotionCharges {
  return {
    className: `${fromClass} → ${toClass}`,
    fromClass,
    toClass,
    charges: [
      { name: 'Promotion Package', amount: 3700, note: 'Includes Books, 1 Uniform, Full-Year Stationery, ID Card & Diary' },
      { name: 'Class Fee', amount: classFee, note: `Annual fee for ${toClass}` },
      { name: 'Classwork & Homework Copies', amount: 300 },
      // Optional charges
      { name: 'Extra Summer Dress', amount: 700, optional: true },
      { name: 'Winter Dress', amount: 1000, optional: true },
      { name: 'Extra Copies', amount: 50, optional: true, note: 'Per additional copy/notebook' },
    ],
  };
}

export const promotionCharges: ClassPromotionCharges[] = [
  buildPromotion('Nursery', 'LKG', 700),
  buildPromotion('LKG', 'UKG', 700),
  buildPromotion('UKG', 'Class 1', 1000),
  buildPromotion('Class 1', 'Class 2', 1250),
  buildPromotion('Class 2', 'Class 3', 1500),
  buildPromotion('Class 3', 'Class 4', 1750),
  buildPromotion('Class 4', 'Class 5', 2000),
  buildPromotion('Class 5', 'Class 6', 2250),
  buildPromotion('Class 6', 'Class 7', 2500),
  buildPromotion('Class 7', 'Class 8', 2750),
];

// ── Helpers ──────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTotalAdmissionFees(cls: ClassFeeStructure): number {
  return (
    cls.admissionFees.reduce((s, f) => s + f.amount, 0) +
    cls.additionalCharges.reduce((s, f) => s + f.amount, 0)
  );
}

export function getTotalMonthlyFees(cls: ClassFeeStructure): number {
  return cls.monthlyFees.reduce((s, f) => s + f.amount, 0);
}

export function getTotalPromotionCharges(cls: ClassPromotionCharges): number {
  return cls.charges.filter(f => !f.optional).reduce((s, f) => s + f.amount, 0);
}

export function getTotalOptionalPromotionCharges(cls: ClassPromotionCharges): number {
  return cls.charges.filter(f => f.optional).reduce((s, f) => s + f.amount, 0);
}
