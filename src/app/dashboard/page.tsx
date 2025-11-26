"use client";

import TableDashboard from "@/components/TableDashboard";
import { useMounted } from "@/lib/useMounted";
import Image from "next/image";
import { useEffect, useState } from "react";
import UploadModal from "@/components/UploadModal";
import { FaEnvelope, FaTrash, FaUpload, FaDownload, FaSearch } from "react-icons/fa";
import Toast from "@/components/Toast";
import { useRealtimeParticipants } from "@/hooks/useRealtimeParticipants";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  const mounted = useMounted();

  // Use real-time participants hook
  const { participants: participantData, isConnected, error: realtimeError, refreshManually } = useRealtimeParticipants();

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch("/api/email-logs");
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch email logs:", error);
    }
  };

  useEffect(() => {
    // Initial load
    setLoading(false);
    fetchEmailLogs();
  }, []);

  // Show realtime error if any
  useEffect(() => {
    if (realtimeError) {
      showToastMessage(`⚠️ Real-time connection: ${realtimeError}`, "error");
    }
  }, [realtimeError]);

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete ALL participants? This cannot be undone.")) {
      try {
        const res = await fetch("/api/participants?all=true", { method: "DELETE" });
        if (res.ok) {
          refreshManually();
          alert("All participants deleted successfully.");
        } else {
          alert("Failed to delete participants.");
        }
      } catch (error) {
        console.error("Error deleting participants:", error);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!confirm("Send emails to ALL participants?")) return;

    setSendingEmail(true);
    try {
      const allIds = participantData.map(p => p.unique);
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueIds: allIds }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchEmailLogs(); // Refresh email logs
      } else {
        alert("Failed to send emails: " + data.error);
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("An error occurred while sending emails.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleResendEmail = async (uniqueId: string) => {
    if (!confirm(`Resend email to participant ${uniqueId}?`)) return;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueIds: [uniqueId] }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Email sent successfully: ${data.success} of ${data.success + data.failed} sent`);
        fetchEmailLogs(); // Refresh email logs
      } else {
        alert("Failed to send email: " + data.error);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending email.");
    }
  };

  const handleUpdateKit = async (uniqueId: string, value: boolean) => {
    try {
      const res = await fetch("/api/participants/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique: uniqueId, seminar_kit: value }),
      });

      if (res.ok) {
        showToastMessage(value ? "✅ Seminar kit ditandai sudah diambil" : "⚠️ Seminar kit ditandai belum diambil", "success");
        refreshManually();
      } else {
        showToastMessage("❌ Gagal update seminar kit", "error");
      }
    } catch (error) {
      console.error("Error updating seminar kit:", error);
      showToastMessage("❌ Terjadi kesalahan", "error");
    }
  };

  const handleUpdateConsumption = async (uniqueId: string, value: boolean) => {
    try {
      const res = await fetch("/api/participants/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique: uniqueId, consumption: value }),
      });

      if (res.ok) {
        showToastMessage(value ? "✅ Consumption ditandai sudah diambil" : "⚠️ Consumption ditandai belum diambil", "success");
        refreshManually();
      } else {
        showToastMessage("❌ Gagal update consumption", "error");
      }
    } catch (error) {
      console.error("Error updating consumption:", error);
      showToastMessage("❌ Terjadi kesalahan", "error");
    }
  };

  const handleExport = async (type: 'all' | 'attended' | 'not-attended') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export?type=${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Peserta_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToastMessage('✅ Data berhasil di-export!', 'success');
      } else {
        showToastMessage('❌ Gagal export data', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('❌ Terjadi kesalahan saat export', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteEmailLog = async (id: number) => {
    if (!confirm('Hapus email log ini?')) return;

    try {
      const res = await fetch(`/api/email-logs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToastMessage('✅ Email log berhasil dihapus', 'success');
        fetchEmailLogs(); // Refresh logs
      } else {
        showToastMessage('❌ Gagal menghapus email log', 'error');
      }
    } catch (error) {
      console.error('Delete email log error:', error);
      showToastMessage('❌ Terjadi kesalahan', 'error');
    }
  };

  if (!mounted) return null;

  const itemsPerPage = 10;

  const filteredData = participantData.filter((participant) => {
    const searchLower = search.toLowerCase();
    const matchName = participant.name.toLowerCase().includes(searchLower);
    const matchUnique = participant.unique.toLowerCase().includes(searchLower);
    const matchEmail = participant.email.toLowerCase().includes(searchLower);
    const matchSearch = matchName || matchUnique || matchEmail;

    const matchStatus = statusFilter === "all" ? true : statusFilter === "present" ? participant.present : !participant.present;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center bg-[#110c2a] font-sans">
      <Image
        src="/tech-element.svg"
        alt="left"
        width={240}
        height={350}
        className="h-4/5 w-auto rotate-180 absolute left-0 z-0 opacity-40"
      />
      <Image
        src="/tech-element.svg"
        alt="right"
        width={240}
        height={350}
        className="h-4/5 w-auto absolute right-0 z-0 opacity-40"
      />

      <div className="w-full min-h-screen p-14 bg-linear-to-r from-[#17D3FD]/20 to-[#CD3DFF]/20 backdrop-blur-sm relative z-10">
        <h1 className="text-6xl text-transparent bg-clip-text bg-linear-to-t from-gray-400 to-white uppercase font-bold font-stormfaze text-center">
          SEMNASTI 2025
        </h1>

        <h2 className="text-gray-200 text-xl mt-2 text-center font-plus-jakarta-sans">
          Dashboard Presensi & Registrasi Ulang Peserta
        </h2>

        <div className="max-w-7xl mx-auto mt-10 rounded-2xl bg-[#181138] border border-[#17D3FD]/30 shadow-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold font-plus-jakarta-sans">Participant List</h2>
              {/* Real-time connection indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-gray-700">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-300">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-2 border border-blue-400 text-blue-300 hover:bg-blue-500/20 transition flex items-center gap-2 rounded-lg"
              >
                <FaUpload /> Upload Data
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-6 py-2 border border-green-400 text-green-300 hover:bg-green-500/20 transition flex items-center gap-2 rounded-lg"
              >
                <FaEnvelope /> {sendingEmail ? "Sending..." : "Send Emails"}
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-6 py-2 border border-red-400 text-red-300 hover:bg-red-500/20 transition flex items-center gap-2 rounded-lg"
              >
                <FaTrash /> Delete All
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="px-6 py-2 border border-purple-400 text-purple-300 hover:bg-purple-500/20 transition flex items-center gap-2 rounded-lg"
                >
                  <FaDownload /> {exporting ? "Exporting..." : "Export Data"}
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0f0b24] border border-purple-400/30 rounded-lg shadow-xl z-10">
                    <button
                      onClick={() => {
                        handleExport('all');
                        setShowExportMenu(false);
                      }}
                      disabled={exporting}
                      className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition flex items-center gap-2 text-gray-200 rounded-t-lg"
                    >
                      <FaDownload className="text-purple-400" /> Semua Peserta
                    </button>
                    <button
                      onClick={() => {
                        handleExport('attended');
                        setShowExportMenu(false);
                      }}
                      disabled={exporting}
                      className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition flex items-center gap-2 text-gray-200"
                    >
                      <FaDownload className="text-green-400" /> Peserta Hadir
                    </button>
                    <button
                      onClick={() => {
                        handleExport('not-attended');
                        setShowExportMenu(false);
                      }}
                      disabled={exporting}
                      className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition flex items-center gap-2 text-gray-200 rounded-b-lg"
                    >
                      <FaDownload className="text-red-400" /> Peserta Tidak Hadir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-6 font-plus-jakarta-sans">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg bg-[#0f0b24] border border-[#17D3FD]/20 text-gray-200 outline-none"
            >
              <option value="all">Semua</option>
              <option value="present">Hadir</option>
              <option value="absent">Tidak Hadir</option>
            </select>

            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, unique code, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f0b24] border border-[#17D3FD]/20 text-gray-200 outline-none placeholder:text-gray-500 focus:border-[#17D3FD]/60 transition"
              />
            </div>
          </div>

          {/* Search Results Info */}
          {search && (
            <div className="mt-4 text-sm text-gray-400 font-plus-jakarta-sans">
              Menampilkan <span className="text-[#17D3FD] font-semibold">{filteredData.length}</span> hasil untuk "{search}"
            </div>
          )}

          <div className="mt-6 overflow-x-auto font-plus-jakarta-sans">
            {loading ? (
              <p className="text-center text-gray-400">Loading data...</p>
            ) : (
              <TableDashboard
                filteredData={paginatedData.map((p) => ({
                  ...p,
                  registered_at: p.registered_at || '',
                  seminar_kit: p.seminar_kit || false,
                  consumption: p.consumption || false,
                }))}
                onResend={handleResendEmail}
                onUpdateKit={handleUpdateKit}
                onUpdateConsumption={handleUpdateConsumption}
              />
            )}
          </div>
          {!loading && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-gray-200 font-plus-jakarta-sans">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border ${currentPage === 1
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : "border-[#17D3FD]/40 text-[#17D3FD] hover:bg-[#17D3FD]/10"
                  }`}
              >
                Prev
              </button>

              {/* Page numbers */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-md border transition-all ${currentPage === page
                        ? "bg-[#17D3FD]/20 border-[#17D3FD] text-[#17D3FD] font-semibold"
                        : "border-gray-600 text-gray-400 hover:bg-white/5"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border ${currentPage === totalPages
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : "border-[#17D3FD]/40 text-[#17D3FD] hover:bg-[#17D3FD]/10"
                  }`}
              >
                Next
              </button>
            </div>
          )}
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadSuccess={refreshManually}
          />
        </div>

        {/* Email History Section */}
        <div className="max-w-7xl mx-auto mt-8 rounded-2xl bg-[#181138] border border-[#17D3FD]/30 shadow-2xl p-8 text-white">
          <h2 className="text-3xl font-bold font-plus-jakarta-sans mb-6">Email History</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-plus-jakarta-sans">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 px-4">Waktu</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Unique ID</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Error</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Belum ada email yang dikirim
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-800 hover:bg-white/5">
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {new Date(log.sent_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-sm">{log.email}</td>
                      <td className="py-3 px-4 text-sm font-mono text-blue-300">
                        {log.participant_unique_id}
                      </td>
                      <td className="py-3 px-4">
                        {log.status === 'success' ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                            ✓ Success
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                            ✗ Error
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-red-300">
                        {log.error_message || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteEmailLog(log.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg text-xs transition flex items-center gap-1"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} type={toastType} show={showToast} />
    </main>
  );
}
