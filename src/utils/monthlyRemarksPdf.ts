/**
 * Generates a parent-friendly PDF of a Monthly Remarks register.
 * Uses jsPDF + jspdf-autotable to produce a clean, multi-page A4 document
 * with school header, summary, per-student blocks (Teacher's Remarks +
 * Message for Parents + Clear Message + sentiment) and page footer.
 *
 * No html2canvas — text-based PDF stays small and crisp.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  RegisterWithEntries,
  MonthlyRemarksEntry,
} from '@/services/monthlyRemarksService';

interface SentimentInfo {
  label: string;
}

function classify(
  remarks: string,
  parent_message: string | null,
  attendance: number | null,
  total: number | null,
): SentimentInfo {
  const text = `${remarks ?? ''} ${parent_message ?? ''}`.toLowerCase();
  const ratio = total && total > 0 && attendance != null ? attendance / total : null;
  if (/excellent|wonderful|very good|perfect/.test(text)) return { label: 'Excellent' };
  if (ratio != null && ratio < 0.5) return { label: 'Needs Care' };
  if (/cries|late|difficulty|trouble|need improvement|still building|low/i.test(text)) return { label: 'Needs Care' };
  if (/slowly|starting to|making progress|settling|improving/.test(text)) return { label: 'Improving' };
  return { label: 'Doing Well' };
}

const COLORS = {
  navy:    [30, 41, 95]    as [number, number, number],
  gold:    [202, 138, 4]   as [number, number, number],
  cream:   [253, 246, 227] as [number, number, number],
  blue:    [37, 99, 235]   as [number, number, number],
  amber:   [180, 83, 9]    as [number, number, number],
  amberBg: [254, 243, 199] as [number, number, number],
  blueBg:  [219, 234, 254] as [number, number, number],
  slate:   [71, 85, 105]   as [number, number, number],
  slate800:[30, 41, 59]    as [number, number, number],
  rose:    [225, 29, 72]   as [number, number, number],
  green:   [21, 128, 61]   as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
};

function sentimentColor(label: string): [number, number, number] {
  switch (label) {
    case 'Excellent':    return COLORS.gold;
    case 'Doing Well':   return COLORS.green;
    case 'Improving':    return COLORS.blue;
    case 'Needs Care':   return COLORS.rose;
    default:             return COLORS.slate;
  }
}

export interface MonthlyRemarksPdfOptions {
  /** Defaults to "First Step School". */
  schoolName?: string;
  /** Defaults to "Saurabh Vihar, Jaitpur, New Delhi 110044". */
  schoolAddress?: string;
}

export function buildMonthlyRemarksPdfFilename(reg: RegisterWithEntries): string {
  const cls = reg.class_name.replace(/\s+/g, '-');
  return `Monthly-Remarks-${cls}-${reg.month}-${reg.academic_year}.pdf`;
}

export async function buildMonthlyRemarksPdf(
  reg: RegisterWithEntries,
  opts: MonthlyRemarksPdfOptions = {},
): Promise<jsPDF> {
  const {
    schoolName = 'First Step School',
    schoolAddress = 'Saurabh Vihar, Jaitpur, New Delhi 110044',
  } = opts;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;

  // ─── Cover band ────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageW, 90, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(schoolName, pageW / 2, 38, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(schoolAddress, pageW / 2, 54, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.cream);
  doc.text('MONTHLY PROGRESS REPORT', pageW / 2, 76, { align: 'center' });

  // ─── Title bar (gold) ──────────────────────────────────────────────────
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 90, pageW, 36, 'F');
  doc.setTextColor(...COLORS.navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(
    `${reg.class_name}${reg.section ? ' · Section ' + reg.section : ''}  ·  ${reg.month}  ·  ${reg.academic_year}`,
    pageW / 2,
    113,
    { align: 'center' },
  );

  // ─── Quick facts row ───────────────────────────────────────────────────
  let cursorY = 145;
  const total = reg.total_present_days ?? null;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.slate800);
  const facts: string[] = [];
  if (total != null) facts.push(`Total Working Days: ${total}`);
  facts.push(`Total Students: ${reg.entries.length}`);
  if (reg.page_label) facts.push(`Register: ${reg.page_label}`);
  doc.text(facts.join('   |   '), margin, cursorY);
  cursorY += 18;

  // ─── Per-student detail blocks via autoTable (multi-row text) ─────────
  // We build a parallel meta[] array (roll/days line) and render it manually
  // in didDrawCell so it appears as a smaller, lighter sub-line under the name.
  const meta: string[] = reg.entries.map((e) => {
    const parts: string[] = [];
    if (e.roll_no) parts.push(`Roll ${e.roll_no}`);
    if (e.attendance_days != null) {
      parts.push(
        total != null
          ? `Days ${e.attendance_days}/${total}`
          : `Days ${e.attendance_days}`,
      );
    }
    return parts.join('   ·   ');
  });

  const body = reg.entries.map((e: MonthlyRemarksEntry) => {
    const sent = classify(e.remarks, e.parent_message, e.attendance_days, total);
    // Two-line student cell — first line bold (name), second line empty space
    // that we fill manually in didDrawCell with the meta string in a lighter style.
    const studentCell = `${e.serial_no}.  ${e.student_name}\n `;
    return [
      studentCell,
      e.remarks ?? '',
      e.parent_message ?? '—',
      e.original_remark ?? '—',
      sent.label,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin, top: 60 },
    head: [
      [
        'Student',
        "Teacher's Remarks",
        'Message for Parents',
        'Clear Message',
        'Status',
      ],
    ],
    body,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      overflow: 'linebreak',
      valign: 'top',
      lineColor: [226, 232, 240],
      textColor: COLORS.slate800,
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 110, fontStyle: 'bold' },
      1: { cellWidth: 130 },
      2: { cellWidth: 130, fillColor: COLORS.blueBg, textColor: COLORS.blue },
      3: { cellWidth: 90, fillColor: COLORS.amberBg, textColor: COLORS.amber, fontStyle: 'italic' },
      4: { cellWidth: 62, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      if (data.column.index === 0) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = COLORS.slate800;
      }
      // Hide raw status text — we'll draw a colored chip in didDrawCell.
      if (data.column.index === 4) {
        data.cell.text = [''];
      }
    },
    didDrawCell: (data) => {
      if (data.section !== 'body') return;

      // Render meta line (Roll · Days) manually in light slate beneath the name.
      if (data.column.index === 0) {
        const m = meta[data.row.index];
        if (m) {
          const x = data.cell.x + 6;
          const y = data.cell.y + 6 + 11 + 11; // padding + name line + meta baseline
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.slate);
          doc.text(m, x, y);
        }
      }

      // Colored status chip in the Status column.
      if (data.column.index === 4) {
        const label = body[data.row.index]?.[4] ?? '';
        const color = sentimentColor(String(label));
        const chipW = Math.min(54, data.cell.width - 8);
        const chipH = 14;
        const cx = data.cell.x + (data.cell.width - chipW) / 2;
        const cy = data.cell.y + (data.cell.height - chipH) / 2;
        doc.setFillColor(...color);
        doc.roundedRect(cx, cy, chipW, chipH, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.white);
        doc.text(String(label).toUpperCase(), cx + chipW / 2, cy + chipH / 2 + 2.5, {
          align: 'center',
        });
      }
    },
    didDrawPage: () => {
      // Footer
      const py = pageH - 24;
      doc.setDrawColor(...COLORS.gold);
      doc.setLineWidth(0.6);
      doc.line(margin, py - 10, pageW - margin, py - 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.slate);
      doc.text(
        `${schoolName}  ·  ${schoolAddress}`,
        margin,
        py,
      );
      const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.text(
        `Page ${pageNum} / ${pageCount}`,
        pageW - margin,
        py,
        { align: 'right' },
      );
    },
  });

  // ─── Closing note on last page (if room) ───────────────────────────────
  const lastY = (doc as any).lastAutoTable?.finalY ?? cursorY;
  if (lastY < pageH - 110) {
    const y = lastY + 24;
    doc.setFillColor(...COLORS.cream);
    doc.roundedRect(margin, y, pageW - margin * 2, 70, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.navy);
    doc.text('A note from the school', margin + 14, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slate800);
    const noteLines = doc.splitTextToSize(
      'Thank you for partnering with us in your child\u2019s growth. The remarks above reflect a single month and are meant to celebrate strengths and gently guide focus areas. We warmly encourage you to spend a few minutes daily on the suggested home activities. For any concerns, please reach out to the class teacher anytime.',
      pageW - margin * 2 - 28,
    );
    doc.text(noteLines, margin + 14, y + 38);
  }

  return doc;
}

/** Triggers a browser download. */
export async function downloadMonthlyRemarksPdf(
  reg: RegisterWithEntries,
  opts?: MonthlyRemarksPdfOptions,
): Promise<void> {
  const doc = await buildMonthlyRemarksPdf(reg, opts);
  doc.save(buildMonthlyRemarksPdfFilename(reg));
}

/** Returns a Blob (handy for Web Share API / WhatsApp). */
export async function buildMonthlyRemarksPdfBlob(
  reg: RegisterWithEntries,
  opts?: MonthlyRemarksPdfOptions,
): Promise<Blob> {
  const doc = await buildMonthlyRemarksPdf(reg, opts);
  return doc.output('blob');
}
