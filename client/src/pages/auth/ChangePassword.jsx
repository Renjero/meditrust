
import { useState } from "react";
import axios from "axios";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
} from "lucide-react";
import { Link } from "react-router-dom";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Your new password must be at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (currentPassword === newPassword) {
      setMessage("Your new password must be different from the current one.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in again to change your password.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        "http://localhost:8080/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "Password changed successfully!"
      );
      setMessageType("success");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        setMessage(
          error.response?.data?.message ||
            "Your session may have expired, or your current password is incorrect."
        );
      } else if (status === 400) {
        setMessage(
          error.response?.data?.message || "Please check your password details."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to change password. Please try again."
        );
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      label: "Current Password",
      value: currentPassword,
      setter: setCurrentPassword,
      visible: showCurrent,
      toggle: () => setShowCurrent((prev) => !prev),
      autoComplete: "current-password",
    },
    {
      label: "New Password",
      value: newPassword,
      setter: setNewPassword,
      visible: showNew,
      toggle: () => setShowNew((prev) => !prev),
      autoComplete: "new-password",
    },
    {
      label: "Confirm New Password",
      value: confirmPassword,
      setter: setConfirmPassword,
      visible: showConfirm,
      toggle: () => setShowConfirm((prev) => !prev),
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-slate-50 via-teal-50/30 to-white px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-lg shadow-teal-600/20">
            <HeartPulse className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Keep your MediTrust account secure.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-teal-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Account security
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Enter your current password, then choose a new password
                containing at least 8 characters.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {passwordFields.map((field, index) => (
              <div key={field.label}>
                <label
                  htmlFor={`password-${index}`}
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  {field.label}
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id={`password-${index}`}
                    type={field.visible ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    autoComplete={field.autoComplete}
                    minLength={index === 0 ? undefined : 8}
                    required
                    disabled={loading}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={field.toggle}
                    aria-label={
                      field.visible ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-teal-600"
                  >
                    {field.visible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {index === 1 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Use at least 8 characters.
                  </p>
                )}
              </div>
            ))}

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <p
                className={`text-xs font-medium ${
                  newPassword === confirmPassword
                    ? "text-teal-700"
                    : "text-red-600"
                }`}
              >
                {newPassword === confirmPassword
                  ? "Passwords match."
                  : "Passwords do not match."}
              </p>
            )}

            {/* Status Message */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
                  messageType === "success"
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                )}

                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 py-3.5 font-semibold text-white shadow-md shadow-teal-600/20 transition hover:from-teal-700 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Updating Password...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-5 w-5" />
                  Update Password
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              to="/auth/dashboard"
              className="flex items-center justify-center gap-2 text-sm font-medium text-teal-700 transition hover:text-teal-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          <ShieldCheck className="mr-1 inline h-4 w-4" />
          Your password is securely processed by MediTrust.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
