interface TableDashboardProps {
  filteredData: Array<{
    unique: string;
    name: string;
    email: string;
    present: boolean;
    seminar_kit: boolean;
    consumption: boolean;
    registered_at: string;
  }>;
  onResend: (unique: string) => void;
  onUpdateKit: (unique: string, value: boolean) => void;
  onUpdateConsumption: (unique: string, value: boolean) => void;
}

function TableDashboard({ filteredData, onResend, onUpdateKit, onUpdateConsumption }: TableDashboardProps) {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="text-left text-gray-300 border-b border-[#17D3FD]/20">
          <th className="py-3 px-2">Registered At</th>
          <th className="py-3 px-2">Unique Code</th>
          <th className="py-3 px-2">Nama</th>
          <th className="py-3 px-2">Email</th>
          <th className="py-3 px-2">Status</th>
          <th className="py-3 px-2">Seminar Kit</th>
          <th className="py-3 px-2">Consumption</th>
          <th className="py-3 px-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredData.map((participant, idx) => (
          <tr key={idx} className="border-b border-[#ffffff]/10 hover:bg-white/5 transition">
            <td className="py-3 px-2">{participant.registered_at ? new Date(participant.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A'}</td>
            <td className="py-3 px-2">{participant.unique}</td>
            <td className="py-3 px-2">{participant.name}</td>
            <td className="py-3 px-2">{participant.email}</td>
            <td className="py-3 px-2">
              {participant.present ? (
                <span className="px-3 py-1 rounded-full bg-green-300/30 text-green-300 font-semibold">Hadir</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-300/30 text-red-300 font-semibold">Tidak Hadir</span>
              )}
            </td>

            {/* Seminar Kit Checkbox - Only show if present */}
            <td className="py-3 px-2">
              {participant.present ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participant.seminar_kit}
                    onChange={(e) => onUpdateKit(participant.unique, e.target.checked)}
                    className="w-5 h-5 accent-purple-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">
                    {participant.seminar_kit ? 'Sudah' : 'Belum'}
                  </span>
                </label>
              ) : (
                <span className="text-gray-500 text-sm">-</span>
              )}
            </td>

            {/* Consumption Checkbox - Only show if present */}
            <td className="py-3 px-2">
              {participant.present ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={participant.consumption}
                    onChange={(e) => onUpdateConsumption(participant.unique, e.target.checked)}
                    className="w-5 h-5 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">
                    {participant.consumption ? 'Sudah' : 'Belum'}
                  </span>
                </label>
              ) : (
                <span className="text-gray-500 text-sm">-</span>
              )}
            </td>

            <td className="py-3 px-2">
              <button
                onClick={() => onResend(participant.unique)}
                className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition text-sm font-semibold"
              >
                Resend Email
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TableDashboard;
