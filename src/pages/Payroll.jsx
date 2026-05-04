import { useState, useEffect } from "react";
import { Search, Download, DollarSign, Zap } from "lucide-react";
import { TableWrapper, EmptyState } from "../components/Table";
import Avatar from "../components/Avatar";
import { API_BASE_URL, getAuthHeaders } from "../api/config";
import { useApp } from "../layouts/DashboardLayout";

const DUMMY_PAYROLL = [
  {
    id: 1,
    emp_no: "55",
    name: "Asad Ali Zaidi",
    department: "Sales",
    basic_salary: 50000,
    ot_amount: 3200,
    late_deduction: 1500,
    absent_deduction: 0,
    net_pay: 51700,
    month: "March 2026",
    status: "Pending",
  },
  {
    id: 3,
    emp_no: "32",
    name: "Nasir Ayyan",
    department: "Finance",
    basic_salary: 60000,
    ot_amount: 5000,
    late_deduction: 0,
    absent_deduction: 0,
    net_pay: 65000,
    month: "March 2026",
    status: "Paid",
  },
  {
    id: 3,
    emp_no: "48",
    name: "Sara Malik",
    department: "HR",
    basic_salary: 45000,
    ot_amount: 0,
    late_deduction: 500,
    absent_deduction: 1000,
    net_pay: 43500,
    month: "March 2026",
    status: "Paid",
  },

  {
    id: 4,
    emp_no: "21",
    name: "Naveed Khan",
    department: "Design",
    basic_salary: 40000,
    ot_amount: 1200,
    late_deduction: 800,
    absent_deduction: 2000,
    net_pay: 38400,
    month: "March 2026",
    status: "Pending",
  },
];

const formatPKR = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const Payroll = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState(DUMMY_PAYROLL);
  const [generating, setGenerating] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  // Load payroll settings from API
  useEffect(() => {
    loadPayrollSettings();
  }, []);

  const loadPayrollSettings = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/settings/payroll`, {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPayrollMonth(json.data.payroll_month || new Date().getMonth() + 1);
          setPayrollYear(json.data.payroll_year || new Date().getFullYear());
        }
      } else {
        // Fallback to localStorage
        const settings = localStorage.getItem("payroll_settings");
        if (settings) {
          const parsed = JSON.parse(settings);
          setPayrollMonth(parsed.payroll_month || new Date().getMonth() + 1);
          setPayrollYear(parsed.payroll_year || new Date().getFullYear());
        }
      }
    } catch (err) {
      console.error("Load settings error:", err);
      // Fallback to localStorage
      const settings = localStorage.getItem("payroll_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        setPayrollMonth(parsed.payroll_month || new Date().getMonth() + 1);
        setPayrollYear(parsed.payroll_year || new Date().getFullYear());
      }
    }
  };

  // Generate payroll
  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const headers = getAuthHeaders();
      const settings = JSON.parse(
        localStorage.getItem("payroll_settings") || "{}",
      );

      const res = await fetch(`${API_BASE_URL}/payroll/generate`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          month: payrollMonth,
          year: payrollYear,
          start_day: settings.payroll_start_day || 1,
          end_day: settings.payroll_end_day || 30,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRecords(json.data || DUMMY_PAYROLL);
          showToast("Payroll generated successfully", "success");
        } else {
          showToast(json.message || "Failed to generate payroll", "error");
        }
      } else {
        // Fallback to dummy data if API not available
        showToast("Using sample payroll data", "info");
      }
    } catch (err) {
      console.error("Generate error:", err);
      showToast("Error generating payroll", "error");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.emp_no.includes(search) ||
      r.department.toLowerCase().includes(search.toLowerCase()),
  );

  const totalNetPay = filtered.reduce((sum, r) => sum + r.net_pay, 0);
  const totalOT = filtered.reduce((sum, r) => sum + r.ot_amount, 0);
  const totalDeductions = filtered.reduce(
    (sum, r) => sum + r.late_deduction + r.absent_deduction,
    0,
  );

  return (
    <div className="animate-fade-slide space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">Payroll</span>{" "}
            <span className="text-white font-bold">Management</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {new Date(payrollYear, payrollMonth - 1).toLocaleDateString("en", {
              month: "long",
              year: "numeric",
            })}{" "}
            — {records.length} employees
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
          <button
            onClick={handleGeneratePayroll}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            <Zap size={14} />
            {generating ? "Generating..." : "Generate Payroll"}
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download size={14} />
            Export Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Total Net Pay
            </p>
            <p className="text-lg font-bold text-slate-100 font-syne">
              {formatPKR(totalNetPay)}
            </p>
          </div>
        </div>
        <div className="card-base p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <DollarSign size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Total OT
            </p>
            <p className="text-lg font-bold text-slate-100 font-syne">
              {formatPKR(totalOT)}
            </p>
          </div>
        </div>
        <div className="card-base p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <DollarSign size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              Total Deductions
            </p>
            <p className="text-lg font-bold text-slate-100 font-syne">
              {formatPKR(totalDeductions)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <TableWrapper
        title="Payroll Records"
        action={
          <div className="flex items-center gap-2 bg-surface/70 border border-border rounded-lg px-3 py-1.5">
            <Search size={12} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee…"
              className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-40"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No payroll records found." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#000000]">
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Employee
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Department
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Basic Salary
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  OT Amount
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Deductions
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Net Pay
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">
                  Status
                </th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap text-center">
                  Slip
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className="table-row-hover last:[&>td]:border-0"
                >
                  {/* Employee */}
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} index={i} size="sm" />
                      <div>
                        <div className="font-medium text-slate-200 text-[13px] whitespace-nowrap">
                          {row.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          #{row.emp_no}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="table-td text-slate-400 text-xs whitespace-nowrap">
                    {row.department}
                  </td>

                  {/* Basic Salary */}
                  <td className="table-td text-slate-300 text-xs font-mono whitespace-nowrap">
                    {formatPKR(row.basic_salary)}
                  </td>

                  {/* OT */}
                  <td className="table-td text-xs font-mono whitespace-nowrap">
                    <span
                      className={
                        row.ot_amount > 0
                          ? "text-emerald-400 font-semibold"
                          : "text-slate-600"
                      }
                    >
                      {row.ot_amount > 0 ? `+${formatPKR(row.ot_amount)}` : "—"}
                    </span>
                  </td>

                  {/* Deductions */}
                  <td className="table-td text-xs font-mono whitespace-nowrap">
                    <span
                      className={
                        row.late_deduction + row.absent_deduction > 0
                          ? "text-red-400 font-semibold"
                          : "text-slate-600"
                      }
                    >
                      {row.late_deduction + row.absent_deduction > 0
                        ? `-${formatPKR(row.late_deduction + row.absent_deduction)}`
                        : "—"}
                    </span>
                  </td>

                  {/* Net Pay */}
                  <td className="table-td whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-100 font-syne">
                      {formatPKR(row.net_pay)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="table-td whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border
                      ${
                        row.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-accent/10 text-accent border-accent/20"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* Download Slip */}
                  <td className="table-td text-center">
                    <button
                      className="btn-ghost hover:!bg-accent/10 hover:!text-accent hover:!border-accent/30"
                      title="Download Slip"
                    >
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  );
};

export default Payroll;
