import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            alert(data.message);
            onUploadSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#181138] border border-[#17D3FD]/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold text-white mb-4 font-plus-jakarta-sans">Upload Participant Data</h2>

                <div
                    className="border-2 border-dashed border-[#17D3FD]/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#17D3FD]/5 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FaCloudUploadAlt className="text-4xl text-[#17D3FD] mb-2" />
                    <p className="text-gray-300 text-center">
                        {file ? file.name : 'Click to upload Excel file (.xlsx)'}
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="hidden"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className={`flex-1 py-2 rounded-lg font-semibold text-white transition ${uploading || !file
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-linear-to-r from-[#17D3FD] to-[#CD3DFF] hover:opacity-90'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
