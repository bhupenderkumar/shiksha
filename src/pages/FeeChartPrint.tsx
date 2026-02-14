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
} from '@/data/fee-structure';
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
        className="max-w-[900px] mx-auto bg-white text-black p-6 sm:p-10 print:p-4 print:max-w-none"
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        {/* School Header */}
        <div className="text-center border-b-4 border-double border-green-700 pb-4 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800 tracking-wide">
            SCHOOL MANAGEMENT SYSTEM
          </h1>
          <p className="text-sm text-gray-600 mt-1">Committed to Quality Education</p>
        </div>

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
                .filter((row) => !highlightClass || row.className === highlightClass)
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

        {/* ── BANK DETAILS ── */}
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

        {/* ── REQUIREMENTS ── */}
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
          @page { margin: 10mm; size: A4 landscape; }
        }
      `}</style>
    </>
  );
}
