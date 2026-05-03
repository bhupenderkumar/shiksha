import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Save, Pencil, Eye, Share2, Loader2, ClipboardList,
  ChevronLeft, GripVertical, Search, Calendar, GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import {
  monthlyRemarksService,
  REMARKS_CLASS_OPTIONS,
  REMARKS_MONTHS,
  type MonthlyRemarksRegister,
  type MonthlyRemarksEntry,
} from '@/services/monthlyRemarksService';

const CURRENT_AY = '2026-27';

type Mode = 'list' | 'edit';

interface DraftEntry {
  id?: string;
  serial_no: number;
  student_name: string;
  roll_no: string;
  attendance_days: number | '';
  remarks: string;
  parent_message: string;
  original_remark: string;
}

const AdminMonthlyRemarks: React.FC = () => {
  const [mode, setMode] = useState<Mode>('list');
  const [registers, setRegisters] = useState<
    (MonthlyRemarksRegister & { entry_count: number })[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Editor state
  const [editingRegister, setEditingRegister] = useState<MonthlyRemarksRegister | null>(null);
  const [draft, setDraft] = useState<DraftEntry[]>([]);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newReg, setNewReg] = useState({
    class_name: '',
    section: '',
    month: '',
    academic_year: CURRENT_AY,
    total_present_days: '' as number | '',
    page_label: '',
  });
  const [creating, setCreating] = useState(false);

  // Confirm delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadRegisters = async () => {
    setLoading(true);
    try {
      const data = await monthlyRemarksService.listRegisterSummaries();
      setRegisters(data);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to load registers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRegisters();
  }, []);

  const filtered = useMemo(() => {
    return registers.filter((r) => {
      if (filterClass !== 'all' && r.class_name !== filterClass) return false;
      if (filterMonth !== 'all' && r.month !== filterMonth) return false;
      if (
        search &&
        !`${r.class_name} ${r.month} ${r.academic_year} ${r.section ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [registers, filterClass, filterMonth, search]);

  // ---------- CREATE ----------
  const handleCreate = async () => {
    if (!newReg.class_name || !newReg.month || !newReg.academic_year) {
      toast.error('Class, month and academic year are required');
      return;
    }
    setCreating(true);
    try {
      const created = await monthlyRemarksService.createRegister({
        class_name: newReg.class_name,
        section: newReg.section || null,
        month: newReg.month,
        academic_year: newReg.academic_year,
        total_present_days:
          newReg.total_present_days === '' ? null : Number(newReg.total_present_days),
        page_label: newReg.page_label || null,
        is_published: true,
      } as any);
      toast.success('Register created');
      setCreateOpen(false);
      setNewReg({
        class_name: '',
        section: '',
        month: '',
        academic_year: CURRENT_AY,
        total_present_days: '',
        page_label: '',
      });
      await loadRegisters();
      void openEditor(created);
    } catch (e: any) {
      toast.error(
        e?.message?.includes('uq_remarks_register')
          ? 'A register for this class+month+year already exists.'
          : e?.message ?? 'Failed to create register'
      );
    } finally {
      setCreating(false);
    }
  };

  // ---------- EDIT ----------
  const openEditor = async (reg: MonthlyRemarksRegister) => {
    setLoading(true);
    try {
      const full = await monthlyRemarksService.getRegisterWithEntries(reg.id);
      setEditingRegister(full ?? reg);
      setDraft(
        (full?.entries ?? []).map((e) => ({
          id: e.id,
          serial_no: e.serial_no,
          student_name: e.student_name,
          roll_no: e.roll_no ?? '',
          attendance_days: e.attendance_days ?? '',
          remarks: e.remarks,
          parent_message: e.parent_message ?? '',
          original_remark: e.original_remark ?? '',
        }))
      );
      setMode('edit');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to load register');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (idx: number, patch: Partial<DraftEntry>) => {
    setDraft((d) => d.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx: number) => {
    setDraft((d) =>
      d
        .filter((_, i) => i !== idx)
        .map((r, i) => ({ ...r, serial_no: i + 1 }))
    );
  };

  const addRow = () => {
    setDraft((d) => [
      ...d,
      {
        serial_no: d.length + 1,
        student_name: '',
        roll_no: '',
        attendance_days: '',
        remarks: '',
        parent_message: '',
        original_remark: '',
      },
    ]);
  };

  const moveRow = (idx: number, dir: -1 | 1) => {
    setDraft((d) => {
      const next = [...d];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return d;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((r, i) => ({ ...r, serial_no: i + 1 }));
    });
  };

  const saveDraft = async () => {
    if (!editingRegister) return;
    setLoading(true);
    try {
      // Save register meta
      await monthlyRemarksService.updateRegister(editingRegister.id, {
        section: editingRegister.section,
        total_present_days: editingRegister.total_present_days,
        page_label: editingRegister.page_label,
        is_published: editingRegister.is_published,
        notes: editingRegister.notes,
      });
      // Replace entries
      await monthlyRemarksService.replaceEntries(
        editingRegister.id,
        draft
          .filter((d) => d.student_name.trim().length > 0)
          .map((d, i) => ({
            serial_no: i + 1,
            student_name: d.student_name.trim(),
            roll_no: d.roll_no?.trim() || null,
            attendance_days:
              d.attendance_days === '' ? null : Number(d.attendance_days),
            remarks: d.remarks ?? '',
            parent_message: d.parent_message?.trim() || null,
            original_remark: d.original_remark?.trim() || null,
          }))
      );
      toast.success('Saved');
      await loadRegisters();
      // Reload editor
      const refreshed = await monthlyRemarksService.getRegisterWithEntries(
        editingRegister.id
      );
      if (refreshed) {
        setEditingRegister(refreshed);
        setDraft(
          refreshed.entries.map((e) => ({
            id: e.id,
            serial_no: e.serial_no,
            student_name: e.student_name,
            roll_no: e.roll_no ?? '',
            attendance_days: e.attendance_days ?? '',
            remarks: e.remarks,
            parent_message: e.parent_message ?? '',
            original_remark: e.original_remark ?? '',
          }))
        );
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // ---------- DELETE ----------
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await monthlyRemarksService.deleteRegister(deleteId);
      toast.success('Register deleted');
      setDeleteId(null);
      await loadRegisters();
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to delete');
    }
  };

  // ---------- SHARE ----------
  const copyShareLink = async (r: MonthlyRemarksRegister) => {
    if (!r.share_token) {
      toast.error('Share token missing — re-save register.');
      return;
    }
    const url = `${window.location.origin}/monthly-remarks?token=${r.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Public link copied');
    } catch {
      toast(url);
    }
  };

  const copyClassMonthLink = async (r: MonthlyRemarksRegister) => {
    const url = `${window.location.origin}/monthly-remarks?class=${encodeURIComponent(
      r.class_name
    )}&month=${encodeURIComponent(r.month)}&year=${encodeURIComponent(
      r.academic_year
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Direct link copied');
    } catch {
      toast(url);
    }
  };

  // ============== RENDER ==============
  if (mode === 'edit' && editingRegister) {
    return (
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <PageHeader
          title={`${editingRegister.class_name} · ${editingRegister.month}`}
          subtitle={`Academic Year ${editingRegister.academic_year}${
            editingRegister.section ? ` · ${editingRegister.section}` : ''
          }`}
          icon={ClipboardList}
          action={
            <div className="flex items-center gap-2">
              <Link
                to={`/monthly-remarks?class=${encodeURIComponent(
                  editingRegister.class_name
                )}&month=${encodeURIComponent(
                  editingRegister.month
                )}&year=${encodeURIComponent(editingRegister.academic_year)}`}
                target="_blank"
              >
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </Button>
              </Link>
              <Button onClick={saveDraft} disabled={loading} size="sm">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          }
        />

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Section</Label>
                <Input
                  value={editingRegister.section ?? ''}
                  onChange={(e) =>
                    setEditingRegister({
                      ...editingRegister,
                      section: e.target.value || null,
                    })
                  }
                  placeholder="DELTA"
                />
              </div>
              <div>
                <Label>Page Label</Label>
                <Input
                  value={editingRegister.page_label ?? ''}
                  onChange={(e) =>
                    setEditingRegister({
                      ...editingRegister,
                      page_label: e.target.value || null,
                    })
                  }
                  placeholder="DELTA (Pg No.)"
                />
              </div>
              <div>
                <Label>Total Working Days</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingRegister.total_present_days ?? ''}
                  onChange={(e) =>
                    setEditingRegister({
                      ...editingRegister,
                      total_present_days:
                        e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex flex-col justify-end">
                <Label className="mb-2">Published</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingRegister.is_published}
                    onCheckedChange={(v) =>
                      setEditingRegister({
                        ...editingRegister,
                        is_published: v,
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {editingRegister.is_published
                      ? 'Visible to public'
                      : 'Hidden from public'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students & Remarks</CardTitle>
            <Button onClick={addRow} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Student
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-16" />
                    <TableHead className="min-w-[160px]">Student Name</TableHead>
                    <TableHead className="w-20">Roll No.</TableHead>
                    <TableHead className="w-24">Days Present</TableHead>
                    <TableHead className="min-w-[260px]">Teacher's Remarks</TableHead>
                    <TableHead className="min-w-[260px]">Message for Parents</TableHead>
                    <TableHead className="min-w-[200px]">Clear Message</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {draft.map((row, idx) => (
                      <motion.tr
                        key={row.id ?? `new-${idx}`}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        className="border-b"
                      >
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-primary text-xs"
                              onClick={() => moveRow(idx, -1)}
                              disabled={idx === 0}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-primary text-xs"
                              onClick={() => moveRow(idx, 1)}
                              disabled={idx === draft.length - 1}
                            >
                              ▼
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.student_name}
                            onChange={(e) =>
                              updateRow(idx, { student_name: e.target.value })
                            }
                            placeholder="e.g. Arnav Sarkar"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.roll_no}
                            onChange={(e) =>
                              updateRow(idx, { roll_no: e.target.value })
                            }
                            placeholder="—"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={row.attendance_days}
                            onChange={(e) =>
                              updateRow(idx, {
                                attendance_days:
                                  e.target.value === '' ? '' : Number(e.target.value),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            rows={3}
                            value={row.remarks}
                            onChange={(e) =>
                              updateRow(idx, { remarks: e.target.value })
                            }
                            placeholder="Teacher's remarks..."
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            rows={3}
                            value={row.parent_message}
                            onChange={(e) =>
                              updateRow(idx, { parent_message: e.target.value })
                            }
                            placeholder="Friendly message / suggestion for parents..."
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            rows={3}
                            value={row.original_remark}
                            onChange={(e) =>
                              updateRow(idx, { original_remark: e.target.value })
                            }
                            placeholder="Original short remark exactly as written by teacher (safe-side reference)"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {draft.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No students yet — click <strong>Add Student</strong> above to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // LIST MODE
  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Monthly Remarks Register"
        subtitle="Manage class-wise monthly remarks shared with parents"
        icon={ClipboardList}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Register
          </Button>
        }
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by class, month, section..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">
                <GraduationCap className="inline h-3 w-3 mr-1" />
                Class
              </Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {Array.from(
                    new Set([...REMARKS_CLASS_OPTIONS, ...registers.map((r) => r.class_name)])
                  ).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">
                <Calendar className="inline h-3 w-3 mr-1" />
                Month
              </Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {REMARKS_MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No registers yet. Click <strong>New Register</strong> to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <motion.tr
                      key={r.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-medium">{r.class_name}</TableCell>
                      <TableCell>{r.month}</TableCell>
                      <TableCell>{r.academic_year}</TableCell>
                      <TableCell>{r.section ?? '—'}</TableCell>
                      <TableCell className="text-center">{r.entry_count}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            'text-xs px-2 py-0.5 rounded-full ' +
                            (r.is_published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700')
                          }
                        >
                          {r.is_published ? 'Published' : 'Hidden'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyClassMonthLink(r)}
                            title="Copy direct link"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditor(r)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(r.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Monthly Register</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Class *</Label>
              <Select
                value={newReg.class_name}
                onValueChange={(v) => setNewReg({ ...newReg, class_name: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {REMARKS_CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month *</Label>
              <Select
                value={newReg.month}
                onValueChange={(v) => setNewReg({ ...newReg, month: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {REMARKS_MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year *</Label>
              <Input
                value={newReg.academic_year}
                onChange={(e) =>
                  setNewReg({ ...newReg, academic_year: e.target.value })
                }
                placeholder="2026-27"
              />
            </div>
            <div>
              <Label>Section</Label>
              <Input
                value={newReg.section}
                onChange={(e) => setNewReg({ ...newReg, section: e.target.value })}
                placeholder="DELTA"
              />
            </div>
            <div>
              <Label>Total Working Days</Label>
              <Input
                type="number"
                min={0}
                value={newReg.total_present_days}
                onChange={(e) =>
                  setNewReg({
                    ...newReg,
                    total_present_days:
                      e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Page Label</Label>
              <Input
                value={newReg.page_label}
                onChange={(e) => setNewReg({ ...newReg, page_label: e.target.value })}
                placeholder="DELTA (Pg No.)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Create & Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this register?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the register and all student remarks under it. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMonthlyRemarks;
