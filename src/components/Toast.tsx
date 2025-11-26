"use client";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  show: boolean;
  title?: string;
}

export default function Toast({ message, type, show, title }: ToastProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 border-green-400 text-white";
      case "error":
        return "bg-red-500 border-red-400 text-white";
      case "warning":
        return "bg-yellow-500 border-yellow-400 text-white";
      case "info":
        return "bg-blue-500 border-blue-400 text-white";
      default:
        return "bg-gray-500 border-gray-400 text-white";
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "success":
        return "Berhasil";
      case "error":
        return "Gagal";
      case "warning":
        return "Peringatan";
      case "info":
        return "Informasi";
      default:
        return "Notifikasi";
    }
  };

  return (
    <div
      className={`fixed font-plus-jakarta-sans bottom-6 max-w-sm w-full right-6 z-50 flex flex-col px-5 py-4 rounded-md border transition-all duration-500 ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        } ${getTypeStyles()}`}
    >
      <h1 className="font-medium">{title || getDefaultTitle()}</h1>
      <p className="text-sm">{message}</p>
    </div>
  );
}
