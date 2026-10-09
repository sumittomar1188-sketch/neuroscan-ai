import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  UploadCloud,
  Sparkles,
  Info,
  Grid,
  List
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ScanCard from '../components/common/ScanCard';
import EmptyState from '../components/common/EmptyState';
import DisclaimerBanner from '../components/common/Disclaimer';
import { useScans } from '../context/ScanContext';

export const MyScans = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const { allScans, userUploads, setCurrentScan } = useScans();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'user', 'demo'
  const [localSearch, setLocalSearch] = useState('');

  const currentSearch = searchQuery !== undefined ? searchQuery : localSearch;
  const handleSearchChange = (val) => {
    if (setSearchQuery) setSearchQuery(val);
    setLocalSearch(val);
  };

  const filteredScans = allScans.filter((scan) => {
    // Filter by type
    if (activeFilter === 'user' && scan.isDemo) return false;
    if (activeFilter === 'demo' && !scan.isDemo) return false;

    // Filter by search string
    if (currentSearch) {
      return scan.filename.toLowerCase().includes(currentSearch.toLowerCase());
    }

    return true;
  });

  const handleViewDetails = (scan) => {
    setCurrentScan(scan);
    navigate('/results');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Scans"
        description="Archive of uploaded brain MRI scans and educational reference records."
      >
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-xs shadow-yellow-500/20 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload MRI Scan</span>
        </button>
      </PageHeader>

      <DisclaimerBanner compact={true} />

      {/* Filter and Search Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-hidden text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({allScans.length})
          </button>

          <button
            onClick={() => setActiveFilter('user')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'user'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            User Uploads ({userUploads.length})
          </button>

          <button
            onClick={() => setActiveFilter('demo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
              activeFilter === 'demo'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sample Records ({allScans.length - userUploads.length})
          </button>
        </div>
      </div>

      {/* Backend Scan-History notice */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Scan History Status:</strong> Scans uploaded during this session are stored locally in state. Sample records are visibly labeled.
          </span>
        </div>
        <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold shrink-0 hidden md:inline">
          Local Session History
        </span>
      </div>

      {/* Grid displaying scans */}
      {filteredScans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredScans.map((scan) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No Scans Match Your Filter"
          description={
            activeFilter === 'user'
              ? 'You have not uploaded any MRI scans during this browser session. Upload an MRI to get started.'
              : 'No MRI scan records match your current search query.'
          }
          actionLabel="Upload New MRI"
          onAction={() => navigate('/upload')}
        />
      )}
    </div>
  );
};

export default MyScans;
