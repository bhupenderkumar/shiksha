import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  feeChartData,
  promotionChartData,
  formatNum,
  getAdmissionTotal,
  getMonthlyTotal,
  getTotalFeeInYear,
  getPromotionTotal,
  getPromotionYearTotal,
  type FeeChartRow,
} from '@/data/fee-structure';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import { Button } from '@/components/ui/button';

/* ───────────────────────────────────────────────────────────────────────
   Print-friendly Fee Chart page – looks like a formal school document.
   Route: /fee-chart  (optionally ?class=Nursery to highlight one class)
   ─────────────────────────────────────────────────────────────────────── */

export default function FeeChartPrint() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const highlightClass = params.get('class'); // e.g. ?class=Nursery

  const handlePrint = () => window.print();

  // Find the specific class data
  const selectedClassData = highlightClass
    ? feeChartData.find((r) => r.className === highlightClass)
    : null;

  return (
    <>
      {/* ── Screen-only toolbar (hidden when printing) ── */}
      <div className="print:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/fee-structure" className="text-sm text-blue-600 hover:underline">
            ← Back to Fee Structure
          </Link>
          <div className="flex gap-2">
            {highlightClass && (
              <Link to="/fee-chart">
                <Button variant="outline" size="sm">Show All Classes</Button>
              </Link>
            )}
            <Button size="sm" onClick={handlePrint}>🖨 Print / Save PDF</Button>
          </div>
        </div>
      </div>

      {/* ── Printable document ── */}
      <div
        ref={chartRef}
        className="w-full bg-white text-black p-4 sm:p-6 md:p-8 print:p-4"
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        {/* School Header — full width, formal style like the reference image */}
        <div className="text-center border-b-4 border-double border-green-700 pb-4 mb-1">
          <div className="flex items-center justify-center gap-4">
            <img
              src={SCHOOL_INFO.logo}
              alt="School Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain print:h-16 print:w-16"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-800 tracking-wide uppercase">
                {SCHOOL_INFO.fullName || SCHOOL_INFO.name}
              </h1>
              <p className="text-sm font-semibold text-gray-700">(Recognised)</p>
              <p className="text-xs text-blue-700 font-medium italic mt-0.5">
                &ldquo;{SCHOOL_INFO.tagline}&rdquo;
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Address:</strong> {SCHOOL_INFO.address}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-xs text-gray-600 mt-1">
            <span>School ID: <strong className="text-green-800">20136251</strong></span>
            <span>Estd: <strong>{SCHOOL_INFO.establishedYear}</strong></span>
            <span>Affiliation No: <strong>{SCHOOL_INFO.affiliationNo}</strong></span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-xs text-gray-600 mt-1">
            <span>Principal: <strong>{SCHOOL_INFO.principalName}</strong></span>
            <span>Phone: <strong>{SCHOOL_INFO.phone}</strong></span>
            <span>Email: <strong>{SCHOOL_INFO.email}</strong></span>
            <span>Website: <strong>{SCHOOL_INFO.website}</strong></span>
          </div>
        </div>

        {/* ── SINGLE CLASS DETAIL VIEW ── */}
        {selectedClassData ? (
          <SingleClassView row={selectedClassData} />
        ) : (
          <AllClassesView />
        )}

        {/* ── BANK DETAILS ── */}
        <BankDetailsSection />

        {/* ── REQUIREMENTS ── */}
        <RequirementsSection />

        {/* ── OFFICIAL FOOTER ── */}
        <OfficialFooter />

        {/* Per-class link list (screen only) */}
        {!highlightClass && (
          <div className="mt-6 print:hidden border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">📄 View Fee Chart for a Specific Class:</h3>
            <div className="flex flex-wrap gap-2">
              {feeChartData.map((row) => (
                <Link
                  key={row.className}
                  to={`/fee-chart?class=${encodeURIComponent(row.className)}`}
                  className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                    row.seatStatus === 'full'
                      ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {row.className}
                  {row.seatStatus === 'full' && ' (Full)'}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Single class info when filtered */}
        {highlightClass && (
          <div className="mt-4 text-center text-xs text-gray-500 print:hidden">
            Showing fee chart for <strong>{highlightClass}</strong> only.{' '}
            <Link to="/fee-chart" className="text-blue-600 hover:underline">View all classes</Link>
          </div>
        )}
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          @page { margin: 8mm; size: ${highlightClass ? 'A4 portrait' : 'A4 landscape'}; }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SINGLE CLASS DETAIL VIEW
   ══════════════════════════════════════════════════════════════════════════ */

function SingleClassView({ row }: { row: FeeChartRow }) {
  const admTotal = getAdmissionTotal(row);
  const monthlyTotal = getMonthlyTotal(row);
  const grandTotal = getTotalFeeInYear(row);

  return (
    <>
      <h2 className="text-center text-lg font-bold text-red-600 mt-4 mb-1 tracking-wider">
        Fee Chart 2026 - 2027
      </h2>
      <h3 className="text-center text-base font-bold text-green-800 mb-4">
        {row.className}
        {row.seatStatus === 'full' && (
          <span className="ml-2 text-red-600 text-sm">(Seat Full)</span>
        )}
      </h3>

      {/* Fee Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm max-w-lg mx-auto">
          <thead>
            <tr className="bg-yellow-100">
              <th className="border border-gray-400 px-4 py-2 text-left" colSpan={2}>
                Admission Fee Details — {row.className}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-400 px-4 py-2 font-medium">Admission Package</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(row.admissionPackage)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 text-xs text-gray-500 pl-8" colSpan={2}>
                Includes: Books, 1 Uniform, Full-Year Stationery, ID Card &amp; Diary
              </td>
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-400 px-4 py-2 font-medium">Extra Summer Dress</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(row.extraSummerDress)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 font-medium">Winter Dress</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(row.winterDress)}</td>
            </tr>
            <tr className="bg-white">
              <td className="border border-gray-400 px-4 py-2 font-medium">CW/HW Copies</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(row.copies)}</td>
            </tr>
            <tr className="bg-green-50 font-bold">
              <td className="border border-gray-400 px-4 py-2 text-green-800">Total One-Time Charges</td>
              <td className="border border-gray-400 px-4 py-2 text-right text-green-800">₹{formatNum(admTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly Fee */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-sm max-w-lg mx-auto">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-gray-400 px-4 py-2 text-left" colSpan={2}>
                Monthly Fee Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-400 px-4 py-2 font-medium">Monthly Fee</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(row.monthlyFee)} / month</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 font-medium">Annual (12 months)</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(monthlyTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-sm max-w-lg mx-auto">
          <thead>
            <tr className="bg-green-100">
              <th className="border border-gray-400 px-4 py-2 text-left text-green-800" colSpan={2}>
                Total Estimated Cost — First Year
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-400 px-4 py-2 font-medium">One-Time Admission Charges</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(admTotal)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 font-medium">Monthly Fee × 12</td>
              <td className="border border-gray-400 px-4 py-2 text-right font-semibold">₹{formatNum(monthlyTotal)}</td>
            </tr>
            <tr className="bg-green-100 font-bold text-base">
              <td className="border-2 border-green-700 px-4 py-3 text-green-800">Grand Total (Year)</td>
              <td className="border-2 border-green-700 px-4 py-3 text-right text-green-800">₹{formatNum(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Seat status banner */}
      {row.seatStatus === 'full' && (
        <div className="mt-4 border-2 border-red-500 bg-red-50 rounded-md p-3 text-center">
          <p className="text-red-700 font-bold text-sm">⚠ Admissions for {row.className} are currently CLOSED — All seats are full.</p>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ALL CLASSES VIEW (original table)
   ══════════════════════════════════════════════════════════════════════════ */

function AllClassesView() {
  return (
    <>

        {/* ── ADMISSION FEE CHART ── */}
      <h2 className="text-center text-lg font-bold text-red-600 mt-4 mb-3 tracking-wider">
        Fee Chart 2026 - 2027
      </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border border-gray-400 px-2 py-2 text-left">Class</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Reg Fee</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Monthly Fee</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Monthly × 12<br /><span className="text-[10px] font-normal">in One Year</span></th>
                <th className="border border-gray-400 px-2 py-2 text-center">Admission<br />Package</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Extra Summer<br />Dress</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Winter<br />Dress</th>
                <th className="border border-gray-400 px-2 py-2 text-center">CW/HW<br />Copies</th>
                <th className="border border-gray-400 px-2 py-2 text-center font-bold text-green-700">
                  Total at<br />Admission
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center">Total Monthly<br />in One Year</th>
                <th className="border border-gray-400 px-2 py-2 text-center font-bold text-green-700">
                  Grand Total<br /><span className="text-[10px] font-normal">Year</span>
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center">Seat<br />Status</th>
              </tr>
            </thead>
            <tbody>
              {feeChartData
                .map((row, i) => {
                  const admTotal = getAdmissionTotal(row);
                  const monthlyTotal = getMonthlyTotal(row);
                  const grandTotal = getTotalFeeInYear(row);
                  const isFull = row.seatStatus === 'full';

                  return (
                    <tr
                      key={row.className}
                      className={
                        isFull
                          ? 'bg-red-50'
                          : i % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50'
                      }
                    >
                      <td className="border border-gray-400 px-2 py-1.5 font-semibold whitespace-nowrap">
                        {row.className}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {row.regFee || '—'}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center font-medium">
                        {formatNum(row.monthlyFee)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(row.monthlyFee)} × 12
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(row.admissionPackage)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(row.extraSummerDress)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(row.winterDress)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(row.copies)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-green-700 bg-green-50">
                        {formatNum(admTotal)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {formatNum(monthlyTotal)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-green-700 bg-green-50">
                        {formatNum(grandTotal)}
                      </td>
                      <td className="border border-gray-400 px-2 py-1.5 text-center">
                        {isFull ? (
                          <span className="text-red-600 font-bold text-[10px] uppercase">Seat Full</span>
                        ) : row.seatStatus === 'limited' ? (
                          <span className="text-amber-600 font-bold text-[10px] uppercase">Limited</span>
                        ) : (
                          <span className="text-green-600 font-semibold text-[10px]">Available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Notes below admission chart */}
      <div className="mt-2 text-[11px] text-gray-600 space-y-0.5 pl-1">
        <p><strong>Admission Package (₹3,700):</strong> Books + 1 Uniform + Full-Year Stationery + ID Card + Diary</p>
        <p><strong>Extra Summer Dress:</strong> ₹700 &nbsp;|&nbsp; <strong>Winter Dress:</strong> ₹1,000 &nbsp;|&nbsp; <strong>CW/HW Copies:</strong> ₹300</p>
      </div>

      {/* ── PROMOTION FEE CHART ── */}
      <h2 className="text-center text-lg font-bold text-blue-700 mt-6 mb-3 tracking-wider">
        Promotion Fee Chart 2026 - 2027
      </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-400 px-2 py-2 text-left">Promotion</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Promotion<br />Package</th>
                <th className="border border-gray-400 px-2 py-2 text-center">CW/HW<br />Copies</th>
                <th className="border border-gray-400 px-2 py-2 text-center font-bold text-blue-700">
                  Total<br />One-time
                </th>
                <th className="border border-gray-400 px-2 py-2 text-center">Monthly<br />Fee</th>
                <th className="border border-gray-400 px-2 py-2 text-center">Monthly × 12<br /><span className="text-[10px] font-normal">in One Year</span></th>
                <th className="border border-gray-400 px-2 py-2 text-center font-bold text-blue-700">
                  Grand Total<br /><span className="text-[10px] font-normal">Year</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {promotionChartData.map((row, i) => {
                const promoTotal = getPromotionTotal(row);
                const yearlyMonthly = row.monthlyFee * row.monthsInYear;
                const grandTotal = getPromotionYearTotal(row);

                return (
                  <tr
                    key={`${row.fromClass}-${row.toClass}`}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="border border-gray-400 px-2 py-1.5 font-semibold whitespace-nowrap">
                      {row.fromClass} → {row.toClass}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                      {formatNum(row.promotionPackage)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                      {formatNum(row.copies)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-blue-700 bg-blue-50">
                      {formatNum(promoTotal)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center font-medium">
                      {formatNum(row.monthlyFee)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center">
                      {formatNum(yearlyMonthly)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-blue-700 bg-blue-50">
                      {formatNum(grandTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      <div className="mt-2 text-[11px] text-gray-600 pl-1">
        <p><strong>Promotion Package (₹3,700):</strong> Books + 1 Uniform + Full-Year Stationery + ID Card + Diary</p>
        <p><strong>Note:</strong> Promotion charges do not include extra dress.</p>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BANK DETAILS SECTION
   ══════════════════════════════════════════════════════════════════════════ */

function BankDetailsSection() {
  return (
    <>
      <h2 className="text-center text-lg font-bold text-green-700 mt-6 mb-3 tracking-wider">
        Bank Details for Fee Payment
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm max-w-lg mx-auto">
          <tbody>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-1.5 font-semibold w-[40%]">Account Holder</td>
              <td className="border border-gray-400 px-3 py-1.5 font-bold">Bhupender Sharma</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 font-semibold">Account Number</td>
              <td className="border border-gray-400 px-3 py-1.5 font-mono font-bold">50424141574</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-1.5 font-semibold">IFSC Code</td>
              <td className="border border-gray-400 px-3 py-1.5 font-mono font-bold">ALLA0212897</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 font-semibold">Branch</td>
              <td className="border border-gray-400 px-3 py-1.5">Sector 37, Faridabad</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-1.5 font-semibold">UPI ID</td>
              <td className="border border-gray-400 px-3 py-1.5 font-mono font-bold">9717267473@ybl</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 font-semibold">Address</td>
              <td className="border border-gray-400 px-3 py-1.5">Ashoka Enclave, Faridabad</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   REQUIREMENTS SECTION
   ══════════════════════════════════════════════════════════════════════════ */

function RequirementsSection() {
  return (
    <>
      <h2 className="text-center text-sm font-bold text-red-600 mt-6 mb-2 uppercase tracking-wider">
        Requirements at the Time of Admission / Registration
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-gray-700 mb-4">
        <div>
          <h4 className="font-bold text-green-700 mb-1 uppercase text-xs">For Nursery to Class 8</h4>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            <li>2 Passport Size Colour Photos</li>
            <li>1 Family Photo</li>
            <li>D.O.B Certificate</li>
            <li>Transfer Certificate (TC/SLC) (Original)</li>
            <li>Aadhaar Card</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-green-700 mb-1 uppercase text-xs">General Documents</h4>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            <li>4 Passport Size Colour Photos</li>
            <li>Character Certificate (CC) (Photocopy)</li>
            <li>Mark Sheet (if applicable)</li>
            <li>Admit Card (if applicable)</li>
            <li>Aadhaar Card (Parent &amp; Student)</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-[10px] font-bold text-red-700 uppercase tracking-wide mt-4 border-t pt-2">
        All documents are necessary at the time of admission.
      </p>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   OFFICIAL FOOTER — Signature & stamp area
   ══════════════════════════════════════════════════════════════════════════ */

function OfficialFooter() {
  return (
    <div className="mt-8 border-t-2 border-green-700 pt-4">
      {/* Terms */}
      <div className="text-[10px] text-gray-500 mb-6 space-y-0.5">
        <p className="font-bold text-gray-700 text-xs mb-1">Terms &amp; Conditions:</p>
        <p>1. Fee once paid is non-refundable under any circumstances.</p>
        <p>2. Monthly fee must be paid by the 10th of every month. Late fee of ₹50 will be charged after due date.</p>
        <p>3. All fee payments should be made via bank transfer or UPI only. Cash payments at the school office are also accepted.</p>
        <p>4. The school reserves the right to revise the fee structure for subsequent academic sessions.</p>
        <p>5. Admission is subject to availability of seats and completion of all required documents.</p>
      </div>

      {/* Signature area */}
      <div className="flex justify-between items-end px-4 sm:px-12 mt-8 mb-2">
        <div className="text-center">
          <div className="border-b border-gray-400 w-40 mb-1" />
          <p className="text-xs font-semibold text-gray-700">{SCHOOL_INFO.accountantName}</p>
          <p className="text-[10px] text-gray-500">Accountant</p>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400 italic mb-1">School Seal</div>
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-gray-400">STAMP</span>
          </div>
        </div>
        <div className="text-center">
          <div className="border-b border-gray-400 w-40 mb-1" />
          <p className="text-xs font-semibold text-gray-700">{SCHOOL_INFO.principalName}</p>
          <p className="text-[10px] text-gray-500">Principal</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-4 bg-green-800 text-white text-center py-1.5 text-[10px] tracking-wide">
        {SCHOOL_INFO.fullName} &nbsp;|&nbsp; School ID: 20136251 &nbsp;|&nbsp; {SCHOOL_INFO.phone} &nbsp;|&nbsp; {SCHOOL_INFO.website}
      </div>
    </div>
  );
}
