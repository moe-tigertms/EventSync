import { useState, type RefObject } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SearchBarProps {
  onSearch: (params: {
    q?: string;
    from?: string;
    to?: string;
    location?: string;
  }) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({ onSearch, searchInputRef }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch({
      q: query.trim() || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      location: location.trim() || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setLocation("");
    onSearch({});
  };

  const hasFilters = fromDate || toDate || location;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search events... (Ctrl+K)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 glass focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-smooth text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-xl border transition-smooth",
            showFilters || hasFilters
              ? "border-primary-300 bg-primary-50 text-primary-600"
              : "border-gray-200 text-gray-500 hover:bg-gray-50"
          )}
          title="Toggle filters"
        >
          <Filter className="w-4 h-4" />
        </button>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 shadow-md shadow-primary-500/20 transition-smooth"
        >
          Search
        </button>
      </div>

      {showFilters && (
        <div className="glass rounded-xl p-4 flex flex-wrap items-end gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Filter by location"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary-400"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
