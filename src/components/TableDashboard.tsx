interface TableDashboardProps {
  filteredData: Array<{
    unique: string;
    name: string;
    email: string;
    present: boolean;
    registered_at: string;
  }>;
  onResend: (unique: string) => void;
}

function TableDashboard({ filteredData, onResend }: TableDashboardProps) {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="text-left text-gray-300 border-b border-[#17D3FD]/20">
          <th className="py-3 px-2">Registered At</th>
          <th className="py-3 px-2">Unique Code</th>
          <th className="py-3 px-2">Nama</th>
          <th className="py-3 px-2">Email</th>
          <th className="py-3 px-2">Status</th>
          <th className="py-3 px-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredData.map((team, idx) => (  
          <tr key={idx} className="border-b border-[#ffffff]/10 hover:bg-white/5 transition">
            <td className="py-3 px-2">{team.registered_at ? new Date(team.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A'}</td>
            <td className="py-3 px-2">{team.unique}</td>
            <td className="py-3 px-2">{team.name}</td>
            <td className="py-3 px-2">{team.email}</td>
            <td className="py-3 px-2">
              {team.present ? (
                <span className="px-3 py-1 rounded-full bg-green-300/30 text-green-300 font-semibold">Hadir</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-red-300/30 text-red-300 font-semibold">Tidak Hadir</span>
              )}
            </td>
            <td className="py-3 px-2">
              <button
                onClick={() => onResend(team.unique)}
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
