import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../api/config";
import { useApp } from "../layouts/DashboardLayout";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKEND_DAYS = [0, 6];
const pad = (n) => String(n).padStart(2, "0");

const AttendanceRegister = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [updatingCell, setUpdatingCell] = useState(false);
  const [payrollSettings, setPayrollSettings] = useState({
    payroll_start_day: 1,
    payroll_end_day: 30,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { showToast } = useApp();

  useEffect(() => {
    loadPayrollSettings();
  }, []);

  const loadPayrollSettings = async () => {
    setLoadingSettings(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/settings/payroll`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPayrollSettings({
            payroll_start_day: json.data.payroll_start_day || 1,
            payroll_end_day: json.data.payroll_end_day || 30,
          });
        }
      } else {
        const saved = localStorage.getItem("payroll_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          setPayrollSettings({
            payroll_start_day: parsed.payroll_start_day || 1,
            payroll_end_day: parsed.payroll_end_day || 30,
          });
        }
      }
    } catch (err) {
      console.error("Load payroll settings error:", err);
      const saved = localStorage.getItem("payroll_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPayrollSettings({
          payroll_start_day: parsed.payroll_start_day || 1,
          payroll_end_day: parsed.payroll_end_day || 30,
        });
      }
    } finally {
      setLoadingSettings(false);
    }
  };

   // ─── CORE FIX ───────────────────────────────────────────────────────────────
  // Payroll cycle is ALWAYS cross-month:
  //   startDay of current month  →  endDay of next month
  // Returns full ISO date strings ["2026-01-14", ..., "2026-02-15"] so that
  // duplicate day numbers (14 and 15 appear in both Jan & Feb) never clash.
  const getDaysInPayrollCycle = () => {
    const startDay = payrollSettings.payroll_start_day;
    const endDay = payrollSettings.payroll_end_day;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const dates = [];

    // Current month: startDay → last day
    for (let d = startDay; d <= daysInCurrentMonth; d++) {
      dates.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    }

    // Next month: 1 → endDay
    for (let d = 1; d <= endDay; d++) {
      dates.push(`${nextYear}-${pad(nextMonth + 1)}-${pad(d)}`);
    }

    return dates;
  };
  // ────────────────────────────────────────────────────────────────────────────

  const days = getDaysInPayrollCycle(); // ["YYYY-MM-DD", ...]

  const isWeekend = (dateString) =>
    WEEKEND_DAYS.includes(new Date(dateString).getDay());

  const getDayNum = (dateString) => parseInt(dateString.split("-")[2], 10);

  const getDayRecord = (employee, dateString) =>
    employee.daily_records?.find((r) => r.date === dateString) || null;

const LEAVE_TYPE_LABELS = {
  "Annual Leaves": "AL",
  "Casual Leaves": "CL",
  "Half Journey Leave": "HJL",
  "Paid Leave": "PL",
  "Sick Leave": "SL",
  "Leave": "LV",
};

const getCellStyle = (employee, dateString) => {
  if (isWeekend(dateString))
    return { bg: "bg-slate-700/30", text: "text-slate-500", label: "WE" };

  const record = getDayRecord(employee, dateString);
  const status = record?.status;
  const leaveType = record?.leave_type;

  // ── Leave types check (status ya leave_type dono check karo) ──
  const leaveKey = leaveType || status;
  if (leaveKey && LEAVE_TYPE_LABELS[leaveKey]) {
    return {
      bg: "bg-purple-500/15",
      text: "text-purple-400",
      label: LEAVE_TYPE_LABELS[leaveKey],
    };
  }

  switch (status) {
    case "Present":
      return { bg: "bg-emerald/15", text: "text-emerald", label: "P" };
    case "Late":
      return { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "L" };
    case "Absent":
      return { bg: "bg-red-500/10", text: "text-red-400", label: "A" };
    case "Half Day":
      return { bg: "bg-blue-500/15", text: "text-blue-400", label: "HD" };
    case "Holiday":
      return { bg: "bg-amber/15", text: "text-amber", label: "H" };
    default:
      return { bg: "bg-slate-800/30", text: "text-slate-600", label: "—" };
  }
};

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const getPayrollPeriodLabel = () => {
    const startDay = payrollSettings.payroll_start_day;
    const endDay = payrollSettings.payroll_end_day;
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return `${MONTHS[month]} ${year} – ${MONTHS[nextMonthIdx]} ${nextYear} (${startDay}–${endDay})`;
  };

  const handleGenerateRegister = async () => {
    setGenerating(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/attendance/register?month=${month + 1}&year=${year}&use_payroll_cycle=true`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        setError(`API Error: ${res.status} ${res.statusText}`);
        return;
      }

      const json = await res.json();
      if (json.success) {
        setEmployees(json.data);
        setStats(json.stats);
      } else {
        setError(json.message || "Failed to generate register");
      }
    } catch (err) {
      console.error("Generate error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCellEdit = (empId, dateString, currentStatus, recordId) => {
    if (isWeekend(dateString)) return;
    setEditingCell({ empId, dateString, status: currentStatus, recordId });
  };

  const handleStatusUpdate = async (empId, dateString, newStatus, recordId) => {
    if (!recordId) {
      showToast("No attendance record found for this day", "error");
      setEditingCell(null);
      return;
    }
    setUpdatingCell(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateString, status: newStatus }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setEmployees((prev) =>
            prev.map((emp) => {
              if (emp.employee_id !== empId) return emp;

              const updatedRecords = [...(emp.daily_records || [])];
              const idx = updatedRecords.findIndex(
                (r) => r.date === dateString,
              );

              if (idx >= 0) {
                updatedRecords[idx] = {
                  ...updatedRecords[idx],
                  status: newStatus,
                };
              } else {
                updatedRecords.push({
                  date: dateString,
                  status: newStatus,
                  id: recordId,
                });
              }

              const newSummary = {
                present: 0,
                late: 0,
                absent: 0,
                half_day: 0,
                holiday: 0,
              };
              updatedRecords.forEach((r) => {
                if (r.status === "Present") newSummary.present++;
                else if (r.status === "Late") newSummary.late++;
                else if (r.status === "Absent") newSummary.absent++;
                else if (r.status === "Half Day") newSummary.half_day++;
                else if (r.status === "Holiday") newSummary.holiday++;
              });

              return {
                ...emp,
                daily_records: updatedRecords,
                summary: { ...emp.summary, ...newSummary },
              };
            }),
          );
          showToast("Attendance updated successfully", "success");
        } else {
          showToast(json.message || "Failed to update attendance", "error");
        }
      } else {
        showToast("Failed to update attendance", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("Error updating attendance", "error");
    } finally {
      setUpdatingCell(false);
      setEditingCell(null);
    }
  };

  return (
    <div className="animate-fade-slide space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">Attendance</span>{" "}
            <span className="text-white font-bold">Register</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {stats
              ? `${stats.total_employees} employees · ${MONTHS[month]} ${year}`
              : "Monthly attendance overview"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="btn-ghost"
              disabled={generating}
            >
              <ChevronLeft size={14} />
            </button>
            <div className="card-base px-4 py-2 text-sm font-semibold text-slate-200 min-w-[150px] text-center">
              {getPayrollPeriodLabel()}
            </div>
            <button
              onClick={nextMonth}
              className="btn-ghost"
              disabled={generating}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={handleGenerateRegister}
            disabled={generating}
            className="btn-primary px-4 py-2 text-sm font-semibold whitespace-nowrap"
          >
            {generating ? (
              <>
                <svg
                  className="animate-spin mr-2 h-4 w-4 inline"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              "Generate Register"
            )}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
        {[
          {
            color: "bg-emerald/20 text-emerald border-emerald/30",
            label: "P — Present",
          },
          {
            color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
            label: "L — Late",
          },
          {
            color: "bg-red-500/10 text-red-400 border-red-500/20",
            label: "A — Absent",
          },
          {
            color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
            label: "HD — Half Day",
          },
          {
            color: "bg-purple-500/15 text-purple-400 border-purple-500/20",
            label: "Leaves — AL , CL , HJL , PL , SL",
          },
          {
            color: "bg-amber/15 text-amber border-amber/30",
            label: "H — Holiday",
          },
          {
            color: "bg-slate-700/30 text-slate-400 border-slate-600",
            label: "WE — Weekend",
          },
        ].map((l) => (
          <span
            key={l.label}
            className={`px-2 sm:px-2.5 py-1 rounded-full border font-semibold text-[10px] sm:text-xs ${l.color}`}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="card-base flex items-center gap-2 py-6 px-4 text-red-400 text-sm">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading */}
      {loadingSettings && (
        <div className="card-base flex items-center justify-center py-12">
          <svg
            className="animate-spin mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-slate-400">Loading payroll settings...</span>
        </div>
      )}

      {/* Register Table */}
      {!error && !loadingSettings && employees.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-[#000000]">
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap sticky left-0 bg-[#000000] z-10 w-[160px]">
                    Employee
                  </th>

                  {days.map((dateString) => (
                    <th
                      key={dateString}
                      className={`table-th font-semibold text-center whitespace-nowrap px-1 ${
                        isWeekend(dateString)
                          ? "bg-red-500/15 text-slate-600"
                          : "bg-[#000000] text-[rgb(173,173,173)]"
                      }`}
                    >
                      <div className="text-[11px]">
                        {pad(getDayNum(dateString))}
                      </div>
                      <div className="text-[9px] opacity-60 hidden lg:block">
                        {new Date(dateString).toLocaleDateString("en", {
                          weekday: "short",
                        })}
                      </div>
                    </th>
                  ))}

                  <th className="table-th text-emerald    text-center text-[12px]">
                    P
                  </th>
                  <th className="table-th text-yellow-400 text-center text-[12px]">
                    L
                  </th>
                  <th className="table-th text-red-400    text-center text-[12px]">
                    A
                  </th>
                  <th className="table-th text-blue-400   text-center text-[12px]">
                    HD
                  </th>
                  <th className="table-th text-amber      text-center text-[12px]">
                    hl
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => {
                  const s = emp.summary;
                  return (
                    <tr key={emp.employee_id} className="table-row-hover">
                      {/* Employee info */}
                      <td className="table-td sticky left-0 bg-card z-10">
                        <div>
                          <div className="font-medium text-slate-200 text-[13px] truncate">
                            {emp.full_name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            #{emp.employee_code}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {emp.designation}
                          </div>
                        </div>
                      </td>

                      {/* Day cells */}
                      {days.map((dateString) => {
                        const record = getDayRecord(emp, dateString);
                        const cell = getCellStyle(emp, dateString);
                        const isEditing =
                          editingCell?.empId === emp.employee_id &&
                          editingCell?.dateString === dateString;
                        const weekend = isWeekend(dateString);

                        return (
                          <td
                            key={dateString}
                            className={`table-td text-center px-1 ${weekend ? "bg-red-500/15" : ""}`}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-0.5 justify-center">
                                <select
                                  value={editingCell.status || ""}
                                  onChange={(e) =>
                                    setEditingCell({
                                      ...editingCell,
                                      status: e.target.value,
                                    })
                                  }
                                  className="text-[10px] px-1 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-200 max-w-[48px]"
                                >
                                  <option value="">—</option>
                                  <option value="Present">Present</option>
                                  <option value="Late">Late</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Half Day">HD</option>
                                  <option value="Holiday">Holiday</option>
                                  <option value="Leave">LV</option>
                                </select>

                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      emp.employee_id,
                                      dateString,
                                      editingCell.status,
                                      editingCell.recordId,
                                    )
                                  }
                                  disabled={updatingCell}
                                  title="Save"
                                  className="flex items-center justify-center w-5 h-5 hover:bg-emerald/20 rounded transition-colors"
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className="text-emerald"
                                  >
                                    <path
                                      d="M2 6l3 3 5-5"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => setEditingCell(null)}
                                  title="Cancel"
                                  className="flex items-center justify-center w-5 h-5 hover:bg-red-500/20 rounded transition-colors"
                                >
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    className="text-red-400"
                                  >
                                    <path
                                      d="M2 2l8 8M10 2l-8 8"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() =>
                                  !weekend &&
                                  handleCellEdit(
                                    emp.employee_id,
                                    dateString,
                                    record?.status || "",
                                    record?.id || null,
                                  )
                                }
                                className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold transition-all
                                  ${cell.bg} ${cell.text}
                                  ${!weekend ? "cursor-pointer hover:ring-2 hover:ring-accent/50" : "cursor-default"}
                                `}
                              >
                                {cell.label}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Summary */}
                      <td className="table-td text-center text-emerald    font-bold text-[12px]">
                        {s.present}
                      </td>
                      <td className="table-td text-center text-yellow-400 font-bold text-[12px]">
                        {s.late}
                      </td>
                      <td className="table-td text-center text-red-400    font-bold text-[12px]">
                        {s.absent}
                      </td>
                      <td className="table-td text-center text-blue-400   font-bold text-[12px]">
                        {s.half_day}
                      </td>
                      <td className="table-td text-center text-amber      font-bold text-[12px]">
                        {s.holiday ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && !loadingSettings && employees.length === 0 && (
        <div className="card-base flex items-center justify-center py-16 text-slate-500 text-sm">
          No attendance register generated yet. Click "Generate Register" to
          create records for {getPayrollPeriodLabel()}.
        </div>
      )}
    </div>
  );
};

export default AttendanceRegister;
