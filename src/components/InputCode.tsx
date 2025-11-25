import React from "react";

function InputCode({
  uniqueCode,
  setUniqueCode,
  handleSubmit,
  isLoading = false,
}: {
  uniqueCode: string;
  setUniqueCode: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters and max 3 characters
    if (/^[A-Z0-9]*$/.test(value) && value.length <= 3) {
      setUniqueCode(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col items-center gap-4 justify-center h-[305px] font-plus-jakarta-sans my-20"
    >
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#CD3DFF] to-[#17D3FD] font-plus-jakarta-sans ">
        Masukan Kode Unik
      </h3>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0f0b24]/90 border border-[#17D3FD]/40">
          <span className="text-gray-400 font-mono">SEMNASTI2025-</span>
          <input
            type="text"
            value={uniqueCode}
            onChange={handleInputChange}
            placeholder="000"
            maxLength={3}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={uniqueCode.length !== 3 || isLoading}
        className={`w-full max-w-md py-3 mt-2 font-semibold rounded-lg shadow-lg transition-all duration-200 ${uniqueCode.length === 3 && !isLoading
          ? 'bg-[#CD3DFF]/90 text-white hover:bg-[#DD49FF]/90 active:scale-95'
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            verify code...
          </span>
        ) : (
          'Submit Kode'
        )}
      </button>
    </form>
  );
}

export default InputCode;
