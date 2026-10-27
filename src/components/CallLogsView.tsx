import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  DollarSign,
  Scale,
} from 'lucide-react';
import { TelnyxCall, CallStatus, CallDirection } from '../types';
import { formatInTimezone } from '../utils/dashboardHelpers';

interface CallLogsViewProps {
  calls: TelnyxCall[];
  onSelectCall: (call: TelnyxCall) => void;
  selectedAssistantId: string | null;
  timezone?: string;
}

type SortField =
  | 'started_at'
  | 'masked_caller'
  | 'assistant_name'
  | 'cost_status'
  | 'duration_sec'
  | 'billed_sec'
  | 'rate_per_min'
  | 'recorded_cost';

export const CallLogsView: React.FC<CallLogsViewProps> = ({
  calls,
  onSelectCall,
  selectedAssistantId,
  timezone = 'UTC',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('started_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filter calls
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const matchesSearch =
        call.telnyx_conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (call.masked_caller && call.masked_caller.includes(searchTerm)) ||
        call.assistant_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || call.cost_status === statusFilter;

      const matchesDirection =
        directionFilter === 'all' || call.direction === directionFilter;

      const matchesAssistant =
        !selectedAssistantId || call.assistant_id === selectedAssistantId;

      return matchesSearch && matchesStatus && matchesDirection && matchesAssistant;
    });
  }, [calls, searchTerm, statusFilter, directionFilter, selectedAssistantId]);

  // Sort calls from table headers
  const sortedCalls = useMemo(() => {
    return [...filteredCalls].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'started_at') {
        valA = new Date(a.started_at).getTime();
        valB = new Date(b.started_at).getTime();
      } else if (sortField === 'duration_sec') {
        valA = a.duration_sec ?? -1;
        valB = b.duration_sec ?? -1;
      } else if (sortField === 'recorded_cost') {
        valA = a.recorded_cost ?? -1;
        valB = b.recorded_cost ?? -1;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCalls, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedCalls.length / pageSize));
  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCalls.slice(start, start + pageSize);
  }, [sortedCalls, currentPage, pageSize]);

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#dcd3c1] group-hover:text-[#8b372b] inline ml-1 shrink-0 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#8b372b] inline ml-1 shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#8b372b] inline ml-1 shrink-0" />
    );
  };

  const totalFilteredMinutes = sortedCalls.reduce((acc, c) => acc + c.billed_sec / 60, 0);
  const totalFilteredCost = sortedCalls.reduce((acc, c) => acc + (c.recorded_cost || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'Conversation ID',
      'Caller',
      'Assistant',
      'Direction',
      'Status',
      `Started At (${timezone})`,
      'Talk Time (sec)',
      'Billed Duration (sec)',
      'Billed Minutes',
      'Rate Per Minute ($)',
      'Call Cost (Sum of Charges) ($)',
    ];

    const rows = sortedCalls.map((c) => [
      c.telnyx_conversation_id,
      `"${c.masked_caller || 'N/A'}"`,
      `"${c.assistant_name}"`,
      c.direction,
      c.cost_status,
      `"${formatInTimezone(c.started_at, timezone)}"`,
      c.duration_sec !== null ? c.duration_sec : 'Unknown',
      c.billed_sec,
      (c.billed_sec / 60).toFixed(2),
      c.rate_per_min.toFixed(4),
      c.recorded_cost !== null ? c.recorded_cost.toFixed(4) : 'Pending',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telnyx_calls_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#e7decb]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3b110c] flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-[#8b372b]" />
            Telnyx Call Detail Records (CDR) & Per-Minute Rates
          </h2>
          <p className="text-xs sm:text-sm text-[#5d3d3a] mt-0.5">
            Click any column header to sort. Click any row to view full itemized Telnyx charge receipts and discrepancy analysis.
          </p>
        </div>

        {/* Quick summary & CSV export */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs font-mono hidden sm:block">
            <div className="text-[#5d3d3a]">
              {sortedCalls.length} calls ·{' '}
              <span className="text-[#3b110c] font-bold">
                {totalFilteredMinutes.toFixed(1)} billed mins
              </span>
            </div>
            <div className="text-[#8b372b] font-bold">
              Total Sum: ${totalFilteredCost.toFixed(4)}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ffffff] hover:bg-[#faf8f2] text-[#3b110c] border border-[#dcd3c1] transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8b372b]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d6360]" />
          <input
            type="text"
            placeholder="Search Conversation ID, caller, assistant..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-[#ffffff] border border-[#dcd3c1] rounded-lg text-[#3b110c] placeholder-[#9c8986] focus:outline-none focus:ring-1 focus:ring-[#8b372b] shadow-2xs"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-2.5 bg-[#ffffff] border border-[#dcd3c1] rounded-lg text-[#3b110c] focus:outline-none focus:ring-1 focus:ring-[#8b372b] cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">Status: All Statuses</option>
            <option value="recorded">Recorded (Priced)</option>
            <option value="pending">Pending (Unpriced)</option>
          </select>
        </div>

        {/* Direction Filter */}
        <div className="sm:col-span-3">
          <select
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-2.5 bg-[#ffffff] border border-[#dcd3c1] rounded-lg text-[#3b110c] focus:outline-none focus:ring-1 focus:ring-[#8b372b] cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">Direction: All</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
      </div>

      {/* MOBILE-FIRST CARDS (< md breakpoint) */}
      <div className="space-y-2.5 md:hidden">
        {paginatedCalls.length === 0 ? (
          <div className="p-8 text-center bg-[#ffffff] rounded-xl border border-[#e7decb] text-[#5d3d3a]">
            No call records match the active criteria.
          </div>
        ) : (
          paginatedCalls.map((call) => {
            const min = call.duration_sec !== null ? Math.floor(call.duration_sec / 60) : 0;
            const sec = call.duration_sec !== null ? call.duration_sec % 60 : 0;
            const billedMin = (call.billed_sec / 60).toFixed(2);
            const hasDiscrepancy = call.cost_discrepancy !== null && Math.abs(call.cost_discrepancy) > 0.0001;

            return (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className="p-3.5 rounded-xl bg-[#ffffff] border border-[#e7decb] hover:border-[#8b372b] active:scale-[0.99] transition-all cursor-pointer space-y-2.5 shadow-2xs"
              >
                {/* Top line: Conversation ID, Status, and Call Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#3b110c]">
                      {call.telnyx_conversation_id}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        call.cost_status === 'recorded'
                          ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                          : 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                      }`}
                    >
                      {call.cost_status}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-[#3b110c] tabular-nums">
                      {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Second line: Assistant name & Caller */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#3b110c] font-semibold truncate max-w-[180px]">
                    {call.assistant_name}
                  </span>
                  <span className="font-mono text-[#5d3d3a] text-[11px]">
                    {call.masked_caller || 'No caller ID'}
                  </span>
                </div>

                {/* Third line: Billed minutes & Per-minute rate */}
                <div className="pt-2 border-t border-[#ede5d5] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#5d3d3a]">
                    <Clock className="w-3 h-3 text-[#8b372b]" />
                    <span>
                      {call.duration_sec !== null ? `${min}m ${sec < 10 ? `0${sec}` : sec}s` : 'Unknown'} ({billedMin}m billed)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#8b372b] font-bold">
                    <span>${call.rate_per_min.toFixed(4)}/min</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#5d3d3a]" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP & TABLET TABLE (>= md breakpoint) */}
      <div className="hidden md:block rounded-xl bg-[#ffffff] border border-[#e7decb] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#e7decb] bg-[#f8eed2]/70 text-[#3b110c] font-mono text-[11px] uppercase tracking-wider select-none">
                <th
                  onClick={() => handleHeaderSort('started_at')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center">
                    Conversation ID / Time
                    {renderSortIcon('started_at')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('masked_caller')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center">
                    Caller
                    {renderSortIcon('masked_caller')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('assistant_name')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center">
                    Assistant
                    {renderSortIcon('assistant_name')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('cost_status')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center">
                    Status
                    {renderSortIcon('cost_status')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('duration_sec')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center justify-end">
                    Talk Time
                    {renderSortIcon('duration_sec')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('billed_sec')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center justify-end">
                    Billed Mins
                    {renderSortIcon('billed_sec')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('rate_per_min')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center justify-end">
                    Rate / Minute
                    {renderSortIcon('rate_per_min')}
                  </span>
                </th>

                <th
                  onClick={() => handleHeaderSort('recorded_cost')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-[#f1e6c5] transition-colors group"
                >
                  <span className="flex items-center justify-end">
                    Call Cost (Sum of Charges)
                    {renderSortIcon('recorded_cost')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d5] font-mono">
              {paginatedCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7d6360] font-sans">
                    No calls found matching the query.
                  </td>
                </tr>
              ) : (
                paginatedCalls.map((call) => {
                  const min = call.duration_sec !== null ? Math.floor(call.duration_sec / 60) : 0;
                  const sec = call.duration_sec !== null ? call.duration_sec % 60 : 0;
                  const billedMin = (call.billed_sec / 60).toFixed(2);

                  return (
                    <tr
                      key={call.id}
                      onClick={() => onSelectCall(call)}
                      title="Click row to inspect full Telnyx charge receipts and details"
                      className="hover:bg-[#f8eed2]/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 font-bold text-[#3b110c]">
                        <div className="text-xs group-hover:text-[#8b372b] transition-colors">
                          {call.telnyx_conversation_id}
                        </div>
                        <div className="text-[10px] text-[#7d6360] font-mono font-normal">
                          {formatInTimezone(call.started_at, timezone, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {call.direction}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-[#5d3d3a]">
                        {call.masked_caller || 'No caller ID'}
                      </td>

                      <td className="py-2.5 px-3 text-[#3b110c] font-sans font-semibold">
                        {call.assistant_name}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            call.cost_status === 'recorded'
                              ? 'bg-[#edf7f1] text-[#1f6f43] border border-[#a8dfc1]'
                              : 'bg-[#fdf8f7] text-[#da1c1c] border border-[#f0c2bd]'
                          }`}
                        >
                          {call.cost_status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right text-[#5d3d3a] tabular-nums">
                        {call.duration_sec !== null ? `${min}m ${sec < 10 ? `0${sec}` : sec}s` : '—'}
                      </td>

                      <td className="py-2.5 px-3 text-right text-[#3b110c] font-bold tabular-nums">
                        {billedMin} min
                      </td>

                      <td className="py-2.5 px-3 text-right text-[#8b372b] font-bold tabular-nums">
                        ${call.rate_per_min.toFixed(4)}/m
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-[#3b110c] tabular-nums">
                        {call.recorded_cost !== null ? `$${call.recorded_cost.toFixed(4)}` : 'Pending'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="p-3 border-t border-[#ede5d5] bg-[#faf8f2] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5d3d3a] font-mono">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-[#ffffff] border border-[#dcd3c1] rounded text-[#3b110c] font-bold cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedCalls.length)} of {sortedCalls.length} calls
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-[#ffffff] border border-[#dcd3c1] hover:bg-[#f0ebe0] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-[#3b110c]" />
            </button>
            <span className="px-2 font-bold text-[#3b110c]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded bg-[#ffffff] border border-[#dcd3c1] hover:bg-[#f0ebe0] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-[#3b110c]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
