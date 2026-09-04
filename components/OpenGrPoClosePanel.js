import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { FiSave } from "react-icons/fi";

function toNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function OpenGrPoClosePanel({ group, saved, onSaved }) {
  const { data: session } = useSession();
  const ponumber = group?.key || "";
  const first = group?.rows?.[0] || {};

  const [toClose, setToClose] = useState(Boolean(saved?.toClose));
  const [reason, setReason] = useState(saved?.reason || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToClose(Boolean(saved?.toClose));
    setReason(saved?.reason || "");
    setError("");
  }, [saved?.toClose, saved?.reason, ponumber]);

  const dirty = useMemo(() => {
    const savedClose = Boolean(saved?.toClose);
    const savedReason = saved?.reason || "";
    return toClose !== savedClose || reason.trim() !== savedReason.trim();
  }, [toClose, reason, saved]);

  const meta = useMemo(() => {
    const rows = group?.rows || [];
    return {
      ponumber,
      vendorcode: first.vendorcode || "",
      vendorname: first.vendorname || "",
      plantCode: first["plant-code"] || "",
      poDate: first["po-date"] || null,
      lineCount: rows.length,
      pendingValSar: rows.reduce((sum, row) => sum + toNumeric(row["pending-val-sar"]), 0),
      poValueSar: rows.reduce((sum, row) => sum + toNumeric(row["po-value-sar"]), 0),
    };
  }, [group, first, ponumber]);

  const handleCheck = (checked) => {
    setToClose(checked);
    setError("");
    if (checked && !reason.trim()) {
      setError("Enter a reason for closing, then Save.");
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save.");
      return;
    }
    if (toClose && reason.trim().length < 3) {
      setError("Reason for closing is required (at least 3 characters).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/purchaseorders/open-gr-closures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...meta,
          toClose,
          reason: reason.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }
      onSaved?.(data.closure);
      toast.success(`PO ${ponumber} close request saved`);
    } catch (err) {
      setError(err.message || "Failed to save");
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-52 max-w-[13.5rem] text-xs text-gray-700 space-y-2">
      <p className="font-semibold text-sky-800 leading-tight">PO {ponumber || "—"}</p>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-gray-400 text-sky-700 focus:ring-sky-500"
          checked={toClose}
          onChange={(e) => handleCheck(e.target.checked)}
        />
        <span className="leading-snug font-medium">No more required — to close</span>
      </label>
      <label className="block">
        <span className="block text-[11px] font-medium text-gray-600 mb-1">
          Reason for closing{toClose ? " *" : ""}
        </span>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          required={toClose}
          placeholder={toClose ? "Required when marking to close" : "Optional unless closing"}
          className={`w-full px-2 py-1.5 border rounded-md text-xs resize-y min-h-[4.5rem] focus:outline-none focus:ring-2 focus:ring-sky-500 ${
            toClose && reason.trim().length < 3
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white"
          }`}
        />
      </label>
      {error ? <p className="text-red-600 leading-snug">{error}</p> : null}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty || (toClose && reason.trim().length < 3)}
        className="inline-flex items-center justify-center gap-1 w-full px-2 py-1.5 rounded-md bg-sky-700 text-white text-xs font-medium hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FiSave className="w-3 h-3" />
        {saving ? "Saving…" : "Save"}
      </button>
      {saved?.updatedAt ? (
        <p className="text-[10px] text-gray-500 leading-snug">
          {saved.toClose ? (
            <span className="inline-block mb-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              Marked to close
            </span>
          ) : (
            <span className="inline-block mb-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              Not closing
            </span>
          )}
          <br />
          Last saved {new Date(saved.updatedAt).toLocaleString()}
          {saved.updatedByName ? ` by ${saved.updatedByName}` : ""}
        </p>
      ) : null}
    </div>
  );
}
