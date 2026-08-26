/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Search,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download,
} from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryViewProps {
  records: HistoryRecord[];
  onSelectRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onNewAnalysis,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.input.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.result.likely_issues[0]?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRiskFilter === 'all' || rec.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  const exportHistoryAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `leaflogic-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-5 sm:py-8 px-3 sm:px-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2.5">
            <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 shrink-0" />
            <span>Local Analysis History</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            Stored locally in your browser only. No private farm data is stored on remote servers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                type="button"
                onClick={exportHistoryAsJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition min-h-[40px] cursor-pointer"
                title="Export history records as JSON"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Export JSON</span>
              </button>

              {confirmClear ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition min-h-[40px] cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-200 text-stone-700 hover:bg-stone-300 transition min-h-[40px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200 min-h-[40px] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Clear All</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition min-h-[40px] cursor-pointer shadow-2xs"
          >
            <span>+ Analyze Crop</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by crop, disease name, or symptoms..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-base sm:text-xs md:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="risk-filter-select" className="text-xs font-semibold text-stone-600 shrink-0">
              Risk:
            </label>
            <select
              id="risk-filter-select"
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="flex-1 sm:flex-initial w-full sm:w-auto px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-600 min-h-[44px] cursor-pointer"
            >
              <option value="all">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">No Analysis History Yet</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
              When you evaluate crop photos with LeafLogic, your assessments and safe recommendations will be saved here locally.
            </p>
          </div>
          <button
            type="button"
            onClick={onNewAnalysis}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-bold hover:bg-emerald-800 transition cursor-pointer"
          >
            Start First Crop Analysis
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-stone-700">No records match your filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedRiskFilter('all');
            }}
            className="text-xs text-emerald-700 font-bold underline cursor-pointer p-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition flex flex-col justify-between gap-3 sm:gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{new Date(rec.timestamp).toLocaleDateString()} • {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <h3 className="text-base font-extrabold text-stone-900 mt-0.5">{rec.cropName}</h3>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      rec.riskLevel === 'Critical' || rec.riskLevel === 'High'
                        ? 'bg-orange-100 text-orange-900 border border-orange-200'
                        : rec.riskLevel === 'Moderate'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {rec.riskLevel} Risk
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                  <span className="font-semibold text-stone-700">Symptoms:</span> {rec.input.symptoms}
                </p>

                {rec.result.likely_issues[0] && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold text-stone-800 truncate max-w-[180px] sm:max-w-[220px]">
                      {rec.result.likely_issues[0].name}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                      {rec.confidenceScore}% Confidence
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => onDeleteRecord(rec.id)}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                  title="Delete record from local storage"
                  aria-label="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectRecord(rec)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition p-1.5 cursor-pointer min-h-[36px]"
                >
                  <span>View Full Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
