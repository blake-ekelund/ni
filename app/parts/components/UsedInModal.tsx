import React from "react";

interface UsedInModalProps {
  modal: {
    open: boolean;
    component?: string;
    list?: string[];
  };
  close: () => void;
}

export function UsedInModal({ modal, close }: UsedInModalProps) {
  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-[#00338d] mb-2">
          Used In {modal.component ?? "—"}
        </h2>

        {modal.list && modal.list.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            {modal.list.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No linked products found.</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-sm bg-[#007EA7] text-white rounded-md hover:bg-[#006A90]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
