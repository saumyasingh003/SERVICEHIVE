import { useState, useEffect } from "react";
import { gigAPI } from "../api";
import GigCard from "../components/GigCard";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiSliders,
  FiX
} from "react-icons/fi";

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGigs();
  }, [status, sortBy]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status !== "all") params.status = status;
      if (sortBy === "newest") params.sort = "-createdAt";
      if (sortBy === "oldest") params.sort = "createdAt";
      if (sortBy === "budget-high") params.sort = "-budget";
      if (sortBy === "budget-low") params.sort = "budget";

      const res = await gigAPI.getAll(params);
      setGigs(res.data.gigs || []);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter(
    (gig) =>
      gig.title.toLowerCase().includes(search.toLowerCase()) ||
      gig.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="w-full px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mt-6">
            Explore <span className="text-green-600">Gigs</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mt-1">
            Browse gigs posted by clients and find your next opportunity.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs..."
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-sm" />
                </button>
              )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="budget-high">Budget ↓</option>
                <option value="budget-low">Budget ↑</option>
              </select>

              <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  <FiGrid className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  <FiList className="text-sm" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              <FiSliders className="text-sm" />
              Filters
            </button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 animate-fade-in">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="budget-high">Budget ↓</option>
                <option value="budget-low">Budget ↑</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredGigs.length}
            </span>{" "}
            gigs
          </p>
        </div>

        {/* Gigs List */}
        {loading ? (
          <LoadingSpinner text="Loading gigs..." />
        ) : filteredGigs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <FiSearch className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              No gigs found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {filteredGigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gigs;
