import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  admissionFeeStructure,
  promotionCharges,
  formatINR,
  getTotalAdmissionFees,
  getTotalMonthlyFees,
  getTotalPromotionCharges,
  getTotalOptionalPromotionCharges,
  type ClassFeeStructure,
  type ClassPromotionCharges,
} from '@/data/fee-structure';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────────────────

function seatBadge(status: ClassFeeStructure['seatStatus']) {
  if (status === 'full')
    return (
      <Badge variant="destructive" className="ml-2 text-xs uppercase tracking-wider">
        Seat Full
      </Badge>
    );
  if (status === 'limited')
    return (
      <Badge variant="warning" className="ml-2 text-xs uppercase tracking-wider">
        Limited Seats
      </Badge>
    );
  return (
    <Badge variant="success" className="ml-2 text-xs uppercase tracking-wider">
      Seats Available
    </Badge>
  );
}

function exportTableToCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportAdmissionCSV() {
  const header = [
    'Class',
    'Seat Status',
    'Charge Type',
    'Charge Name',
    'Amount (₹)',
    'Note',
  ];
  const rows: string[][] = [header];

  admissionFeeStructure.forEach((cls) => {
    const statusLabel =
      cls.seatStatus === 'full'
        ? 'Seat Full'
        : cls.seatStatus === 'limited'
          ? 'Limited Seats'
          : 'Available';

    cls.admissionFees.forEach((f) =>
      rows.push([cls.className, statusLabel, 'One-time Admission', f.name, String(f.amount), f.note || ''])
    );
    cls.monthlyFees.forEach((f) =>
      rows.push([cls.className, statusLabel, 'Monthly Fee', f.name, String(f.amount), f.note || ''])
    );
    cls.additionalCharges.forEach((f) =>
      rows.push([cls.className, statusLabel, 'Additional Charge', f.name, String(f.amount), f.note || ''])
    );
  });

  exportTableToCSV('admission_fee_structure.csv', rows);
}

function exportPromotionCSV() {
  const header = ['Promotion', 'Charge Name', 'Amount (₹)', 'Type'];
  const rows: string[][] = [header];

  promotionCharges.forEach((cls) => {
    cls.charges.forEach((f) =>
      rows.push([cls.className, f.name, String(f.amount), f.optional ? 'Optional' : 'Mandatory'])
    );
  });

  exportTableToCSV('promotion_charges.csv', rows);
}

// ── Admission Table for a single class ───────────────────────────────────

function AdmissionClassTable({ cls }: { cls: ClassFeeStructure }) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card shadow-sm overflow-hidden',
        cls.seatStatus === 'full' && 'opacity-75'
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 bg-muted/40 border-b gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{cls.className}</h3>
          {seatBadge(cls.seatStatus)}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            One-time: {formatINR(getTotalAdmissionFees(cls))}
          </span>
          <span className="mx-2">|</span>
          <span className="font-medium text-foreground">
            Monthly: {formatINR(getTotalMonthlyFees(cls))}/month
          </span>
        </div>
      </div>

      {cls.seatStatus === 'full' && (
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 px-5 py-2 text-center text-sm font-medium text-red-700 dark:text-red-300">
          Admissions for {cls.className} are currently closed — all seats are full.
        </div>
      )}

      {/* Admission Fees (One-time) */}
      <div className="px-5 pt-4 pb-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Admission Charges (One-time)
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Particulars</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="hidden sm:table-cell">Includes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cls.admissionFees.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(f.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{f.note || '—'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-primary/5 font-bold">
              <TableCell>Total One-time</TableCell>
              <TableCell className="text-right">{formatINR(getTotalAdmissionFees(cls))}</TableCell>
              <TableCell className="hidden sm:table-cell" />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Monthly Fees */}
      <div className="px-5 pb-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Monthly Recurring Fee
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Particulars</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cls.monthlyFees.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(f.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Promotion Table for a single class ───────────────────────────────────

function PromotionClassTable({ cls }: { cls: ClassPromotionCharges }) {
  const mandatoryCharges = cls.charges.filter(f => !f.optional);
  const optionalCharges = cls.charges.filter(f => f.optional);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-muted/40 border-b">
        <h3 className="text-lg font-semibold">{cls.className}</h3>
        <span className="text-sm font-medium text-foreground">
          Total: {formatINR(getTotalPromotionCharges(cls))}
        </span>
      </div>

      {/* Mandatory Charges */}
      <div className="px-5 pt-4 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Particulars</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="hidden sm:table-cell">Includes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mandatoryCharges.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-right font-semibold">{formatINR(f.amount)}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{f.note || '—'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-primary/5 font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                {formatINR(getTotalPromotionCharges(cls))}
              </TableCell>
              <TableCell className="hidden sm:table-cell" />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Optional Charges */}
      {optionalCharges.length > 0 && (
        <div className="px-5 pb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            Optional Charges
            <Badge variant="outline" className="text-xs font-normal">As needed</Badge>
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Particulars</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead className="hidden sm:table-cell">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optionalCharges.map((f) => (
                <TableRow key={f.name} className="text-muted-foreground">
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-right font-semibold">{formatINR(f.amount)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs">{f.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function FeeStructurePage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const topRef = useRef<HTMLDivElement>(null);

  const filteredAdmission =
    selectedClass === 'all'
      ? admissionFeeStructure
      : admissionFeeStructure.filter((c) => c.className === selectedClass);

  return (
    <div ref={topRef} className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="text-primary">🏫</span> School Fee Structure
          </Link>
          <Link to="/admission-enquiry">
            <Button size="sm">Apply for Admission</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Fee Structure 2026-27
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent breakdown of admission fees, monthly charges and
            promotion fees for every class. All amounts are in <strong>INR (₹)</strong>.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="admission" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="admission">Admission Fees &amp; Charges</TabsTrigger>
              <TabsTrigger value="promotion">Promotion Charges</TabsTrigger>
            </TabsList>
          </div>

          {/* ── Admission Tab ─────────────────────────────────────────── */}
          <TabsContent value="admission" className="space-y-6">
            {/* Class filter + Export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedClass === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedClass('all')}
                >
                  All Classes
                </Button>
                {admissionFeeStructure.map((c) => (
                  <Button
                    key={c.className}
                    variant={selectedClass === c.className ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedClass(c.className)}
                    className="relative"
                  >
                    {c.className}
                    {c.seatStatus === 'full' && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                    )}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={exportAdmissionCSV}>
                ⬇ Export CSV
              </Button>
            </div>

            {/* Seat legend */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Seats Available
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Limited Seats
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> Seat Full
              </span>
            </div>

            {/* Cards */}
            <div className="grid gap-6">
              {filteredAdmission.map((cls) => (
                <AdmissionClassTable key={cls.className} cls={cls} />
              ))}
            </div>

            {/* Combined Summary Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-muted/40 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Summary — All Classes</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Admission (One-time)</TableHead>
                      <TableHead className="text-right">Monthly Fee</TableHead>
                      <TableHead className="text-center">Seat Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admissionFeeStructure.map((cls) => (
                      <TableRow
                        key={cls.className}
                        className={cn(cls.seatStatus === 'full' && 'bg-red-50/50 dark:bg-red-950/20')}
                      >
                        <TableCell className="font-medium">{cls.className}</TableCell>
                        <TableCell className="text-right">
                          {formatINR(getTotalAdmissionFees(cls))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatINR(getTotalMonthlyFees(cls))}
                        </TableCell>
                        <TableCell className="text-center">{seatBadge(cls.seatStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Promotion Tab ─────────────────────────────────────────── */}
          <TabsContent value="promotion" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Charges applicable when a student is promoted to the next class at the start of a new
                session.
              </p>
              <Button variant="outline" size="sm" onClick={exportPromotionCSV}>
                ⬇ Export CSV
              </Button>
            </div>

            <div className="grid gap-6">
              {promotionCharges.map((cls) => (
                <PromotionClassTable key={cls.className} cls={cls} />
              ))}
            </div>

            {/* Promotion Summary */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-muted/40 border-b">
                <h3 className="text-lg font-semibold">Summary — Promotion Charges</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promotion</TableHead>
                      <TableHead className="text-right">Mandatory (₹)</TableHead>
                      <TableHead className="text-right">Optional (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotionCharges.map((cls) => (
                      <TableRow key={cls.className}>
                        <TableCell className="font-medium">{cls.className}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatINR(getTotalPromotionCharges(cls))}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatINR(getTotalOptionalPromotionCharges(cls))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bank Details */}
        <div className="mt-10 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-muted/40 border-b">
            <h3 className="text-lg font-semibold">🏦 Bank Details for Fee Payment</h3>
          </div>
          <div className="px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Holder</p>
                  <p className="text-base font-bold">Bhupender Sharma</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Number</p>
                  <p className="text-lg font-bold font-mono tracking-wider">50424141574</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IFSC Code</p>
                  <p className="text-lg font-bold font-mono tracking-wider">ALLA0212897</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch</p>
                  <p className="text-base font-medium">Sector 37, Faridabad</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Holder Address</p>
                  <p className="text-base font-medium">Ashoka Enclave, Faridabad</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">UPI ID</p>
                  <p className="text-lg font-bold font-mono tracking-wider">9717267473@ybl</p>
                  <p className="text-xs text-muted-foreground">Name: Bhupender Sharma</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Please share the payment screenshot or transaction ID with the school office after making the payment.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> The fee structure is subject to revision. Please contact the school
          office for the latest information. All fees are non-refundable unless stated otherwise.
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} School Management System. For queries, contact the admin
          office.
        </div>
      </footer>
    </div>
  );
}
