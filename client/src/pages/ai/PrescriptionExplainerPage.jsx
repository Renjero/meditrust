import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  Eye
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import aiService from '../../services/aiService';

export default function PrescriptionExplainerPage({ onNavigate }) {
  const navigate = useNavigate();
  const goPharmacy = () => (onNavigate ? onNavigate('pharmacy') : navigate('/pharmacy'));
  const { user } = useSelector((state) => state.auth);
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [imageOpen, setImageOpen] = useState(false);

  const { mutate, isPending, isSuccess, isError, error, data } = useMutation({
    mutationFn: (selected) => aiService.scanPrescription(selected, user?.token),
  });

  useEffect(() => {
    if (isSuccess && data) {
      toast.success("Prescription scanned");
      setResult(data);
    }
    if (isError && error) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || "Scan failed");
    }
  }, [isSuccess, data, isError, error]);

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setResult(null);
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleScan = () => {
    if (!file) {
      toast.error("Select a prescription file first");
      return;
    }
    mutate(file);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (isPending) {
    return <Loader />;
  }

  const medicines = result?.medicines || [];
  const enlargedSrc = result?.image || preview;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* AI safety notice */}
      <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            AI can make mistakes
          </h4>
          <p className="text-xs text-amber-900/80 mt-0.5">
            Double-check medicine names and dosage with your pharmacist or doctor before ordering or taking anything.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="purple" size="sm">
          Vision OCR & Clinical Parser
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Prescription Explainer
        </h1>
        <p className="text-sm text-slate-600">
          Upload any handwritten doctor's slip or clinic discharge summary. Our medical vision model deciphers medication schedules, food instructions, and safety precautions.
        </p>
      </div>

      {/* Upload Zone & Scan State */}
      <Card className="p-8 border-dashed border-2 border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 text-center transition-all">

        {isPending ? (
          /* Animated Scanning State */
          <div className="py-10 space-y-4 max-w-md mx-auto animate-pulse">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Scan className="w-10 h-10 animate-spin" />
              </div>
              <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl animate-ping" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-indigo-950">
                Scanning Doctor's Handwriting...
              </h3>
              <p className="text-xs text-indigo-700/80">
                Running optical character recognition and matching against FDA pharmacopeia database...
              </p>
            </div>

            <div className="w-48 bg-indigo-200 rounded-full h-1.5 mx-auto overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        ) : (
          /* Dropzone */
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Drag & Drop Your Prescription Image or PDF
              </h3>
              <p className="text-xs text-slate-400">
                Supports JPG, PNG, PDF up to 20MB. Clear lighting produces best accuracy.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {file && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-700">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">{file.name}</span>
                {preview && (
                  <img src={preview} alt="prescription preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              {!file ? (
                <Button
                  variant="ai"
                  size="md"
                  onClick={() => fileRef.current?.click()}
                  icon={Sparkles}
                >
                  Select Prescription File
                </Button>
              ) : (
                <Button
                  variant="ai"
                  size="md"
                  onClick={handleScan}
                  icon={Sparkles}
                >
                  Upload & Scan New Slip
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        )}

      </Card>

      {/* Extracted Results Section */}
      {result && !isPending && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Enlarged uploaded prescription */}
          {enlargedSrc && (
            <Card className="p-4 border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Uploaded Prescription
                </h3>
                <Button variant="outline" size="sm" onClick={() => setImageOpen(true)} icon={Eye}>
                  View Enlarged
                </Button>
              </div>
              <button type="button" onClick={() => setImageOpen(true)} className="block w-full cursor-zoom-in">
                <img
                  src={enlargedSrc}
                  alt="uploaded prescription enlarged"
                  className="w-full max-h-[480px] object-contain rounded-xl border border-slate-200 bg-white"
                />
              </button>
            </Card>
          )}

          {/* Metadata Strip */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">{result._id?.slice(-8) || "RX-SCAN"}</span>
                <Badge variant="success" size="sm" dot>
                  AI Extracted
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Prescribed by: {result.doctor_name || "Unknown"}
              </h3>
              <p className="text-xs text-slate-500">Patient: {result.patient_name || "Unknown"} • Date: {result.date || "Unknown"}</p>
              {result.diagnosis_notes && (
                <p className="text-xs text-slate-500 mt-1">Notes: {result.diagnosis_notes}</p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goPharmacy}
              icon={Pill}
            >
              Order All Medicines via Pharmacy
            </Button>
          </div>

          {/* Cards for each extracted medicine */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Extracted Medications & Dosage Schedule ({medicines.length})
            </h3>

            {medicines.map((med, index) => (
              <Card key={index} className="p-6 border-slate-200 shadow-xs space-y-4">

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{med.name || "Unclear"}</h4>
                    </div>
                    <p className="text-xs text-slate-400 pl-7">{med.dosage || "Dosage unclear"}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={goPharmacy}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">

                  {/* Daily Timing Pills */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Frequency
                    </span>
                    <span className="text-xs text-slate-500 block pt-1">{med.frequency || "Not specified"}</span>
                    <span className="text-xs text-slate-500 block pt-1">Duration: {med.duration || "Not specified"}</span>
                  </div>

                  {/* Food Instruction */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Administration Guideline
                    </span>
                    <p className="text-xs font-medium text-slate-800 flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      {med.dosage || "Check packaging label"}
                    </p>
                  </div>

                  {/* Safety & Interactions */}
                  <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                      Safety & Food Precautions
                    </span>
                    <p className="text-xs text-amber-900 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      {med.notes || "Verify with pharmacist"}
                    </p>
                  </div>

                </div>

              </Card>
            ))}
          </div>

          <div className="rounded-xl bg-slate-100 p-4 text-xs text-slate-500 text-center">
            MediTrust AI extraction is an assistive readout. Always double-check dosage instructions with the packaging label and your pharmacist.
          </div>

        </div>
      )}

      <Modal
        isOpen={imageOpen}
        onClose={() => setImageOpen(false)}
        title="Prescription Image"
        subtitle="Compare AI text with the original slip"
        maxWidth="max-w-4xl"
      >
        {enlargedSrc && (
          <img src={enlargedSrc} alt="prescription full" className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-50" />
        )}
      </Modal>

    </div>
  );
}
