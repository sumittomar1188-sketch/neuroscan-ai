import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FolderOpen,
  BrainCircuit,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  ShieldAlert,
  Clock,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ScanCard from '../components/common/ScanCard';
import DisclaimerBanner from '../components/common/Disclaimer';
import PageHeader from '../components/common/PageHeader';
import { useScans } from '../context/ScanContext';

// Import the four brain MRI carousel images
import mriScan1 from '../assets/mri_scan_1.jpg';
import mriScan2 from '../assets/mri_scan_2.jpg';
import mriScan3 from '../assets/mri_scan_3.jpg';
import mriScan4 from '../assets/mri_scan_4.jpg';

const MRI_CAROUSEL_IMAGES = [
  { src: mriScan1, label: 'Axial T1 — Normal Brain' },
  { src: mriScan2, label: 'Coronal T2 — Cerebral View' },
  { src: mriScan3, label: 'Sagittal T1 — Midline Section' },
  { src: mriScan4, label: 'Axial T1+C — Lesion Detected' },
];

/** Auto-advancing MRI image carousel with gold dot indicators */
const MriCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);
  const total = MRI_CAROUSEL_IMAGES.length;

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % total);
        setFade(true);
      }, 200); // short fade-out before switching
    }, 2000);
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    setFade(false);
    setTimeout(() => {
      setCurrent(idx);
      setFade(true);
      startInterval();
    }, 150);
  };

  const img = MRI_CAROUSEL_IMAGES[current];

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Fixed-size image container — never resizes regardless of image */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-yellow-500/25 shadow-2xl shadow-yellow-500/10"
        style={{ height: '260px', background: '#050505' }}
      >
        <img
          key={current}
          src={img.src}
          alt={img.label}
          className="w-full h-full object-cover"
          style={{
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.25s ease-in-out',
          }}
        />
        {/* Subtle gold-tinted bottom gradient label overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-[11px] font-mono text-yellow-300/80 truncate">{img.label}</p>
        </div>
        {/* Corner badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 rounded-full text-[10px] font-bold text-yellow-400 font-mono">
          SAMPLE
        </div>
      </div>

      {/* Gold dot indicators */}
      <div className="flex items-center gap-2">
        {MRI_CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Show image ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === current
                ? 'w-5 h-2 bg-yellow-400 shadow-sm shadow-yellow-400/50'
                : 'w-2 h-2 bg-zinc-600 hover:bg-yellow-600/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const Dashboard = ({ searchQuery }) => {
  const navigate = useNavigate();
  const { allScans, userUploads, setCurrentScan } = useScans();

  const filteredScans = searchQuery
    ? allScans.filter((s) => s.filename.toLowerCase().includes(searchQuery.toLowerCase()))
    : allScans;

  const handleViewDetails = (scan) => {
    setCurrentScan(scan);
    navigate('/results');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Hero Banner ─── */}
      <div
        className="relative overflow-hidden text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-yellow-900/30"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 55%, #0d0d0d 100%)' }}
      >
        {/* Ambient gold glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-400/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-600/4 rounded-full blur-2xl pointer-events-none" />

        {/* Two-column layout: text left, carousel right */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
          {/* Left: existing hero content */}
          <div className="flex-1 space-y-5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/25 rounded-full text-xs font-semibold text-yellow-300/90">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>Educational Research Prototype — ResNet50 Classifier</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                NeuroScan AI
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              An advanced AI-assisted medical imaging prototype designed for brain tumor analysis from MRI scans. Classifies images into{' '}
              <strong className="text-yellow-200">Glioma</strong>,{' '}
              <strong className="text-yellow-200">Meningioma</strong>,{' '}
              <strong className="text-yellow-200">No Tumor</strong>, and{' '}
              <strong className="text-yellow-200">Pituitary</strong> using deep learning.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-yellow-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New MRI</span>
              </button>

              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-800/70 hover:bg-zinc-700/80 text-stone-200 font-semibold rounded-xl border border-yellow-700/30 hover:border-yellow-600/50 transition-all text-sm cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-yellow-400" />
                <span>Explore Model Details</span>
              </button>
            </div>
          </div>

          {/* Right: MRI image carousel */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0">
            <MriCarousel />
          </div>
        </div>
      </div>

      {/* Subtle inline disclaimer */}
      <DisclaimerBanner />

      {/* Statistics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Classification Statistics
            </h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md border border-slate-200">
              {userUploads.length > 0 ? `${userUploads.length} User Uploads` : 'Sample Data Mode'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Scans"
            value={allScans.length}
            subtitle={userUploads.length > 0 ? `${userUploads.length} live upload(s)` : 'Includes sample records'}
            icon={Layers}
            color="blue"
            isDemo={userUploads.length === 0}
            trend="+12%"
          />
          <StatCard
            title="Glioma"
            value="1"
            subtitle="Demo category reference"
            icon={BrainCircuit}
            color="amber"
            isDemo={true}
          />
          <StatCard
            title="Meningioma"
            value="1"
            subtitle="Demo category reference"
            icon={BrainCircuit}
            color="purple"
            isDemo={true}
          />
          <StatCard
            title="No Tumor"
            value="1"
            subtitle="Demo category reference"
            icon={CheckCircle2}
            color="emerald"
            isDemo={true}
          />
          <StatCard
            title="Pituitary"
            value="1"
            subtitle="Demo category reference"
            icon={BrainCircuit}
            color="teal"
            isDemo={true}
          />
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-500">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                Upload New MRI
              </div>
              <div className="text-xs text-slate-500">JPG, JPEG, or PNG format</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/scans')}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-yellow-50/60 border border-slate-200/80 hover:border-yellow-200 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl group-hover:scale-110 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-yellow-700 transition-colors">
                View My Scans
              </div>
              <div className="text-xs text-slate-500">Scan library and records</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-stone-100/60 border border-slate-200/80 hover:border-stone-300 rounded-xl transition-all text-left group cursor-pointer"
          >
            <div className="p-3 bg-zinc-100 text-zinc-700 rounded-xl group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm group-hover:text-zinc-700 transition-colors">
                About Model
              </div>
              <div className="text-xs text-slate-500">ResNet50 & Grad-CAM info</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Recent MRI Scans
            </h2>
            <p className="text-xs text-slate-500">
              Showing recent user uploads and sample reference scans
            </p>
          </div>
          <button
            onClick={() => navigate('/scans')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            <span>View All Scans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredScans.slice(0, 4).map((scan) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
