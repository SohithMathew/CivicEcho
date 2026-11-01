import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  MapPin,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Loader2,
  Trash2,
  ImageIcon,
  ZoomIn,
  RefreshCw
} from 'lucide-react';
import { civicApi } from '../services/api';
import { Complaint, User } from '../types';
import { detectRealLocation } from '../services/locationService';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (complaint: Complaint) => void;
  currentUser?: User | null;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintCreated,
  currentUser
}) => {
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [locationName, setLocationName] = useState(currentUser?.neighborhood || '');
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Image upload state (Only direct device / camera upload)
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [imagePreviewZoomed, setImagePreviewZoomed] = useState(false);

  // AI & submission states
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const triggerGpsDetection = async () => {
    setDetectingGps(true);
    setGpsMessage({ text: 'Accessing device GPS...', type: 'info' });
    try {
      const loc = await detectRealLocation();
      setLatitude(loc.latitude.toFixed(6));
      setLongitude(loc.longitude.toFixed(6));
      setLocationName(loc.locationName);
      setGpsMessage({
        text: `✓ Current location detected (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`,
        type: 'success'
      });
      setTimeout(() => {
        setGpsMessage(null);
      }, 5000);
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      setGpsMessage({
        text: err?.message || 'Could not acquire GPS position. Please allow location permissions.',
        type: 'error'
      });
    } finally {
      setDetectingGps(false);
    }
  };

  // Auto-detect real GPS location on modal mount
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.name && !citizenName) {
        setCitizenName(currentUser.name);
      }
      triggerGpsDetection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process and downscale large user photos to maintain snappy performance
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setProcessingImage(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setProcessingImage(false);
      setErrorMsg('Could not read the selected image file.');
    };

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => {
        setProcessingImage(false);
        setErrorMsg('Failed to process image data.');
      };

      img.onload = () => {
        try {
          const maxDim = 1280;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setImageUrl(rawDataUrl);
            setImageMeta({
              name: file.name,
              size: `${Math.round(file.size / 1024)} KB`
            });
            setProcessingImage(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
          const approxBytes = Math.round((optimizedDataUrl.length * 3) / 4);
          const sizeStr =
            approxBytes > 1024 * 1024
              ? `${(approxBytes / (1024 * 1024)).toFixed(2)} MB`
              : `${Math.round(approxBytes / 1024)} KB`;

          setImageUrl(optimizedDataUrl);
          setImageMeta({
            name: file.name,
            size: sizeStr
          });
          setProcessingImage(false);
        } catch {
          setImageUrl(rawDataUrl);
          setImageMeta({
            name: file.name,
            size: `${Math.round(file.size / 1024)} KB`
          });
          setProcessingImage(false);
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImageMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUseCurrentLocation = () => {
    triggerGpsDetection();
  };

  const handleRunAiTriage = async () => {
    if (!description || description.trim().length < 5) {
      setErrorMsg('Please enter at least 5 characters for the description before running AI triage.');
      return;
    }
    setErrorMsg(null);
    setAnalyzingAi(true);
    try {
      const latNum = latitude ? parseFloat(latitude) : undefined;
      const lonNum = longitude ? parseFloat(longitude) : undefined;
      const result = await civicApi.analyzeComplaintAI({
        description,
        category,
        imageData: imageUrl || undefined,
        latitude: latNum,
        longitude: lonNum,
        location_name: locationName || undefined
      });
      setAiTriageResult(result);
      if (result.detected_category) {
        setCategory(result.detected_category);
      }
    } catch (err: any) {
      console.error('AI Triage error:', err);
      setErrorMsg('Could not complete AI triage. You can still proceed and submit your report.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate description (strictly required, min 5 chars)
    if (!description || description.trim().length < 5) {
      setErrorMsg('Issue Description is required and must have at least 5 characters.');
      return;
    }

    // 2. Validate damage image upload (strictly required)
    if (!imageUrl) {
      setErrorMsg('Damage photograph is required. Please upload an image of the disruption from your device or camera.');
      return;
    }

    // 3. Validate Category (strictly required)
    if (!category || !category.trim()) {
      setErrorMsg('Please select a category for the civic disruption.');
      return;
    }

    // 4. Validate Reporter Name (strictly required)
    if (!citizenName || !citizenName.trim()) {
      setErrorMsg('Reporter / Citizen Name is required.');
      return;
    }

    // 5. Validate Landmark / Zone (strictly required)
    if (!locationName || !locationName.trim()) {
      setErrorMsg('Landmark / Zone location is required to dispatch municipal teams.');
      return;
    }

    // 6. Validate Latitude & Longitude (strictly required numeric coordinates)
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMsg('A valid Latitude coordinate between -90 and 90 is required.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setErrorMsg('A valid Longitude coordinate between -180 and 180 is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const newRecord = await civicApi.createComplaint({
        description: description.trim(),
        latitude: lat,
        longitude: lon,
        category: category.trim(),
        image_url: imageUrl,
        citizen_id: currentUser?.id || 'usr-citizen-01',
        citizen_name: citizenName.trim(),
        citizen_email: currentUser?.email || 'citizen@civicecho.org',
        location_name: locationName.trim()
      });
      onComplaintCreated(newRecord);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.[0]?.msg || 'Failed to submit complaint to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Report Civic Issue</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Provide issue details and attach a photograph of the damage for triage.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Issue Description <span className="text-rose-500 font-bold">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-sans"
              placeholder="Describe the hazard (e.g. Deep pothole with cracked road sub-base)..."
            />
          </div>

          {/* 2. Photo Evidence Upload Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                <span>Damage Photo Evidence <span className="text-rose-500 font-bold">*</span></span>
              </span>

              {imageUrl ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Photo Attached</span>
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-medium">
                  Upload Required
                </span>
              )}
            </div>

            {/* Hidden native inputs for file browsing and mobile camera capture */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* DIRECT FILE & CAMERA UPLOAD DROPZONE */}
            {!imageUrl && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {processingImage ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                    <span className="text-xs text-slate-600">Processing damage photograph...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Upload an image of the damage <span className="text-rose-500">*</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Drag and drop an image file here, or choose an option below (JPG, PNG, WebP)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-teal-600" />
                        <span>Take Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ATTACHED IMAGE PREVIEW CARD */}
            {imageUrl && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3.5 shadow-2xs">
                <div className="relative w-full sm:w-28 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group">
                  <img
                    src={imageUrl}
                    alt="Damage evidence"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreviewZoomed(!imagePreviewZoomed)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="View full image"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 w-full space-y-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {imageMeta?.name || 'Attached Damage Photograph'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>{imageMeta?.size || 'Image Ready'}</span>
                    <span>·</span>
                    <span className="text-teal-700 font-sans font-medium">
                      Device Upload
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-slate-600 hover:text-teal-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace Photo</span>
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Zoomed Image View Overlay */}
            {imagePreviewZoomed && imageUrl && (
              <div
                onClick={() => setImagePreviewZoomed(false)}
                className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 cursor-pointer"
              >
                <div className="relative max-w-3xl max-h-[85vh] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
                  <img
                    src={imageUrl}
                    alt="Expanded damage evidence preview"
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                    Click anywhere to close
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Category & Reporter Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Road Damage">Road Damage</option>
                <option value="Water Supply">Water Supply &amp; Drainage</option>
                <option value="Electrical & Power">Electrical &amp; Power</option>
                <option value="Sanitation">Sanitation &amp; Garbage</option>
                <option value="Public Safety">Public Safety &amp; Lighting</option>
                <option value="Traffic Infrastructure">Traffic Signals &amp; Signage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Reporter / Citizen Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                placeholder="E.g. Arjun Menon"
              />
            </div>
          </div>

          {/* 4. Location Coordinates & Landmark */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Location &amp; Landmark <span className="text-rose-500 font-bold">*</span></span>
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {detectingGps ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 text-teal-600" />
                    <span>Auto-Detect Current Location</span>
                  </>
                )}
              </button>
            </div>

            {gpsMessage && (
              <div
                className={`text-[11px] px-2.5 py-1.5 rounded flex items-center gap-1.5 ${
                  gpsMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : gpsMessage.type === 'error'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}
              >
                {gpsMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                {gpsMessage.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                {gpsMessage.type === 'info' && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 shrink-0" />}
                <span>{gpsMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-600 block mb-0.5">
                  Latitude <span className="text-rose-500 font-bold">*</span>
                </span>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-teal-600"
                  placeholder="e.g. 37.7749"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-600 block mb-0.5">
                  Longitude <span className="text-rose-500 font-bold">*</span>
                </span>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:border-teal-600"
                  placeholder="e.g. -122.4194"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-600 block mb-0.5">
                  Landmark / Address <span className="text-rose-500 font-bold">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-600"
                  placeholder="Street name or neighborhood"
                />
              </div>
            </div>
          </div>

          {/* 5. Real-time AI Pre-Triage Assessment Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-slate-800">AI Diagnostic Triage</span>
              </div>
              <button
                type="button"
                onClick={handleRunAiTriage}
                disabled={analyzingAi}
                className="text-xs px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {analyzingAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Run AI Triage</span>
                  </>
                )}
              </button>
            </div>

            {aiTriageResult ? (
              <div className="space-y-3 text-xs">
                {aiTriageResult.image_corroborated === false && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Visual check: Uploaded image does not corroborate civic damage. Urgency set to Low pending manual field verification.</span>
                  </div>
                )}
                {aiTriageResult.image_corroborated === true && (
                  <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Visual evidence verified: Photograph corroborates reported infrastructure damage.</span>
                  </div>
                )}

                {/* Overall Score & Level Banner */}
                <div className="p-3 rounded-lg border bg-white flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        aiTriageResult.hazard_factors?.score_level === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : aiTriageResult.hazard_factors?.score_level === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : aiTriageResult.hazard_factors?.score_level === 'Moderate'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      Hazard Level: {aiTriageResult.hazard_factors?.score_level || (aiTriageResult.hazard_score >= 70 ? 'High' : aiTriageResult.hazard_score >= 40 ? 'Moderate' : 'Low')}
                    </span>
                    <span className="font-mono text-teal-800 font-bold text-sm">
                      {aiTriageResult.hazard_score}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Priority: <strong className="text-slate-800">{aiTriageResult.urgency}</strong></span>
                    <span>·</span>
                    <span>Dept: <strong className="text-slate-800">{aiTriageResult.responsible_department}</strong></span>
                  </div>
                </div>

                {/* 5-Factor Triage Matrix */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      5-Factor Hazard Score Assessment
                    </span>
                    <span className="text-[10px] text-teal-700 font-semibold">
                      AI Synthesized Matrix
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                    {/* 1. Uploaded Image */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] block truncate">📷 Image Check</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {aiTriageResult.hazard_factors?.image_evidence_rating || (aiTriageResult.image_corroborated ? 'Moderate' : 'Low')}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          (aiTriageResult.hazard_factors?.image_evidence_rating === 'High') ? 'bg-rose-500' :
                          (aiTriageResult.hazard_factors?.image_evidence_rating === 'Moderate') ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>

                    {/* 2. Description */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] block truncate">📝 Description</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {aiTriageResult.hazard_factors?.description_severity_rating || (aiTriageResult.urgency === 'Critical' ? 'High' : aiTriageResult.urgency === 'High' ? 'Moderate' : 'Low')}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          (aiTriageResult.hazard_factors?.description_severity_rating === 'High') ? 'bg-rose-500' :
                          (aiTriageResult.hazard_factors?.description_severity_rating === 'Moderate') ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>

                    {/* 3. Area Criticality */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] block truncate">🏙️ Area Density</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {aiTriageResult.hazard_factors?.area_criticality_rating || 'Moderate'}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          (aiTriageResult.hazard_factors?.area_criticality_rating === 'High') ? 'bg-rose-500' :
                          (aiTriageResult.hazard_factors?.area_criticality_rating === 'Moderate') ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>

                    {/* 4. Geographical Location */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between">
                      <span className="text-slate-500 text-[10px] block truncate">🧭 Geo Location</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {aiTriageResult.hazard_factors?.geographical_location_rating || 'Moderate'}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          (aiTriageResult.hazard_factors?.geographical_location_rating === 'High') ? 'bg-rose-500' :
                          (aiTriageResult.hazard_factors?.geographical_location_rating === 'Moderate') ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>

                    {/* 5. Similar Cases Nearby */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-between col-span-2 sm:col-span-1">
                      <span className="text-slate-500 text-[10px] block truncate">📍 Nearby Similar</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {aiTriageResult.hazard_factors?.nearby_similar_cases_rating || (aiTriageResult.similar_cases_count >= 2 ? 'High' : 'Low')}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          (aiTriageResult.hazard_factors?.nearby_similar_cases_rating === 'High') ? 'bg-rose-500' :
                          (aiTriageResult.hazard_factors?.nearby_similar_cases_rating === 'Moderate') ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Justification of Why Score is High or Low */}
                  {aiTriageResult.hazard_factors?.justification && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-snug">
                      <strong className="text-slate-900">Hazard Evaluation:</strong> {aiTriageResult.hazard_factors.justification}
                    </div>
                  )}
                </div>

                {/* Spatial, Geographic & Historical Frequency Intelligence Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {typeof aiTriageResult.similar_cases_count === 'number' && (
                    <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-medium">
                      📋 {aiTriageResult.similar_cases_count} similar city cases reported
                    </span>
                  )}
                  {aiTriageResult.geographical_risk_factor && (
                    <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-medium">
                      📍 {aiTriageResult.geographical_risk_factor}
                    </span>
                  )}
                  {aiTriageResult.compound_risk_level && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      ⚠️ Compound Threat: {aiTriageResult.compound_risk_level}
                    </span>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200 text-[11px]">
                  <strong>Root Diagnostic:</strong> {aiTriageResult.root_cause_hypothesis}
                </p>

                {/* Correlated Nearby Complaints */}
                {Array.isArray(aiTriageResult.correlated_nearby_incidents) && aiTriageResult.correlated_nearby_incidents.length > 0 && (
                  <div className="space-y-1 bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Correlated Nearby Incidents &amp; Compounding Risk:
                    </span>
                    <div className="space-y-1">
                      {aiTriageResult.correlated_nearby_incidents.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>
                            <strong className="text-slate-800">{item.distance_km}km away:</strong> {item.compounding_effect || item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 border-t border-slate-200 pt-1.5">
                  Status on submit: <strong className="text-amber-700 font-medium">Pending Municipal Authority Verification</strong>
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Click &quot;Run AI Triage&quot; to review preliminary assessment. Submitted complaints are reviewed and verified by concerned municipal authorities before dispatch.
              </p>
            )}
          </div>

          {/* 6. Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || processingImage}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Issue Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaintModal;
