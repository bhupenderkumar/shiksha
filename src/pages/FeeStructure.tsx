import { Link } from 'react-router-dom';
import {
  feeChartData,
  promotionChartData,
  formatINR,
  formatNum,
  getAdmissionTotal,
  getMonthlyTotal,
  getTotalFeeInYear,
  getPromotionTotal,
  getPromotionYearTotal,
  type FeeChartRow,
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

function seatBadge(status: FeeChartRow['seatStatus']) {
  if (status === 'full')
    return <Badge variant="destructive" className="text-[10px] uppercase">Seat Full</Badge>;
  if (status === 'limited')
    return <Badge variant="warning" className="text-[10px] uppercase">Limited</Badge>;
  return <Badge variant="success" className="text-[10px] uppercase">Available</Badge>;
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
  const header = ['Class', 'Admission Package', 'Extra Summer Dress', 'Winter Dress', 'Copies', 'Total One-time', 'Monthly Fee', 'Seat Status'];
  const rows: string[][] = [header];
  feeChartData.forEach((r) => {
    rows.push([
      r.className,
      String(r.admissionPackage),
      String(r.extraSummerDress),
      String(r.winterDress),
      String(r.copies),
      String(getAdmissionTotal(r)),
      String(r.monthlyFee),
      r.seatStatus === 'full' ? 'Seat Full' : r.seatStatus === 'limited' ? 'Limited' : 'Available',
    ]);
  });
  exportTableToCSV('admission_fee_structure.csv', rows);
}

function exportPromotionCSV() {
  const header = ['From', 'To', 'Promotion Package', 'Copies', 'Total', 'Monthly Fee'];
  const rows: string[][] = [header];
  promotionChartData.forEach((r) => {
    rows.push([
      r.fromClass,
      r.toClass,
      String(r.promotionPackage),
      String(r.copies),
      String(getPromotionTotal(r)),
      String(r.monthlyFee),
    ]);
  });
  exportTableToCSV('promotion_charges.csv', rows);
}

export default function FeeStructurePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="text-primary">🏫</span> School Fee Structure
          </Link>
          <div className="flex gap-2">
            <Link to="/fee-chart">
              <Button variant="outline" size="sm">📄 Fee Chart</Button>
            </Link>
            <Link to="/admission-enquiry">
              <Button size="sm">Apply for Admission</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-primary/5 to-background py-10 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Fee Structure 2026-27
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent breakdown of admission fees, monthly charges and promotion
            fees for every class. All amounts are in <strong>INR (₹)</strong>.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="admission" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="admission">Admission Fees &amp; Charges</TabsTrigger>
            <TabsTrigger value="promotion">Promotion Charges</TabsTrigger>
          </TabsList>

          {/* ── Admission Tab ── */}
          <TabsContent value="admission" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Limited
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> Seat Full
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={exportAdmissionCSV}>
                ⬇ Export CSV
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-primary/5 border-b">
                <h3 className="text-lg font-bold">Admission Fee Chart — All Classes</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Admission Package includes: Books, 1 Uniform, Full-Year Stationery, ID Card &amp; Diary
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Class</TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Admission</div>
                        <div className="text-[10px] font-normal text-muted-foreground">Package</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Summer</div>
                        <div className="text-[10px] font-normal text-muted-foreground">Extra Dress</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Winter</div>
                        <div className="text-[10px] font-normal text-muted-foreground">Dress</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Copies</div>
                        <div className="text-[10px] font-normal text-muted-foreground">CW + HW</div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-primary">
                        <div>Total</div>
                        <div className="text-[10px] font-normal">One-time</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Monthly</div>
                        <div className="text-[10px] font-normal text-muted-foreground">Fee</div>
                      </TableHead>
                      <TableHead className="text-center font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeChartData.map((row) => (
                      <TableRow
                        key={row.className}
                        className={cn(
                          row.seatStatus === 'full' && 'bg-red-50/50 dark:bg-red-950/10',
                          'hover:bg-muted/30'
                        )}
                      >
                        <TableCell className="font-semibold whitespace-nowrap">{row.className}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.admissionPackage)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.extraSummerDress)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.winterDress)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.copies)}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-sm text-primary">{formatNum(getAdmissionTotal(row))}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">{formatNum(row.monthlyFee)}/mo</TableCell>
                        <TableCell className="text-center">{seatBadge(row.seatStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-5 py-3 bg-muted/20 border-t text-xs text-muted-foreground space-y-1">
                <p><strong>Admission Package (₹3,700):</strong> Books + 1 Uniform + Full-Year Classroom Stationery + ID Card + Diary</p>
                <p><strong>Extra Summer Dress:</strong> ₹700 | <strong>Winter Dress:</strong> ₹1,000 | <strong>CW/HW Copies:</strong> ₹300</p>
              </div>
            </div>

            {/* Yearly cost summary */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-muted/40 border-b">
                <h3 className="text-lg font-bold">Estimated First-Year Cost (Admission + 12 months)</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-bold">Class</TableHead>
                      <TableHead className="text-right font-bold">One-time (₹)</TableHead>
                      <TableHead className="text-right font-bold">12 × Monthly (₹)</TableHead>
                      <TableHead className="text-right font-bold text-primary">Total Year (₹)</TableHead>
                      <TableHead className="text-center font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeChartData.map((row) => (
                      <TableRow
                        key={row.className}
                        className={cn(
                          row.seatStatus === 'full' && 'bg-red-50/50 dark:bg-red-950/10'
                        )}
                      >
                        <TableCell className="font-semibold">{row.className}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatINR(getAdmissionTotal(row))}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatINR(getMonthlyTotal(row))}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-sm text-primary">{formatINR(getTotalFeeInYear(row))}</TableCell>
                        <TableCell className="text-center">{seatBadge(row.seatStatus)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── Promotion Tab ── */}
          <TabsContent value="promotion" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Charges when a student is promoted to the next class (new session). <strong>Does not include dress.</strong>
              </p>
              <Button variant="outline" size="sm" onClick={exportPromotionCSV}>
                ⬇ Export CSV
              </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-primary/5 border-b">
                <h3 className="text-lg font-bold">Promotion Fee Chart</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Promotion Package includes: Books, 1 Uniform, Full-Year Stationery, ID Card &amp; Diary (no extra dress)
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Promotion</TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Package</div>
                        <div className="text-[10px] font-normal text-muted-foreground">Books+Uniform+etc</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Copies</div>
                        <div className="text-[10px] font-normal text-muted-foreground">CW + HW</div>
                      </TableHead>
                      <TableHead className="text-right font-bold text-primary">
                        <div>Total</div>
                        <div className="text-[10px] font-normal">One-time</div>
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        <div>Monthly</div>
                        <div className="text-[10px] font-normal text-muted-foreground">New Class</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotionChartData.map((row) => (
                      <TableRow key={`${row.fromClass}-${row.toClass}`} className="hover:bg-muted/30">
                        <TableCell className="font-semibold whitespace-nowrap">{row.fromClass} → {row.toClass}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.promotionPackage)}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatNum(row.copies)}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-sm text-primary">{formatNum(getPromotionTotal(row))}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">{formatNum(row.monthlyFee)}/mo</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Promotion yearly summary */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-muted/40 border-b">
                <h3 className="text-lg font-bold">Estimated Year Cost After Promotion</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-bold">Promotion</TableHead>
                      <TableHead className="text-right font-bold">Promotion Fees (₹)</TableHead>
                      <TableHead className="text-right font-bold">12 × Monthly (₹)</TableHead>
                      <TableHead className="text-right font-bold text-primary">Total Year (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotionChartData.map((row) => (
                      <TableRow key={`${row.fromClass}-${row.toClass}`}>
                        <TableCell className="font-semibold whitespace-nowrap">{row.fromClass} → {row.toClass}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatINR(getPromotionTotal(row))}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatINR(row.monthlyFee * row.monthsInYear)}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-sm text-primary">{formatINR(getPromotionYearTotal(row))}</TableCell>
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
          © {new Date().getFullYear()} School Management System. For queries, contact the admin office.
        </div>
      </footer>
    </div>
  );
}
