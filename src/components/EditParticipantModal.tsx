import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

interface EditParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    participant: { unique: string; name: string; email: string } | null;
    onUpdate: (unique: string, name: string, email: string) => Promise<void>;
}

export default function EditParticipantModal({ isOpen, onClose, participant, onUpdate }: EditParticipantModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (participant) {
            setName(participant.name);
            setEmail(participant.email);
        }
    }, [participant]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant) return;

        setLoading(true);
        try {
            await onUpdate(participant.unique, name, email);
            onClose();
        } catch (error) {
            console.error("Failed to update participant:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !participant) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#181138] border border-[#17D3FD]/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-white font-plus-jakarta-sans">Edit Participant</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-[#0f0b24] border border-gray-600 text-white focus:border-[#17D3FD] focus:ring-1 focus:ring-[#17D3FD] outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-[#0f0b24] border border-gray-600 text-white focus:border-[#17D3FD] focus:ring-1 focus:ring-[#17D3FD] outline-none transition"
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#17D3FD] to-blue-600 text-white font-bold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
