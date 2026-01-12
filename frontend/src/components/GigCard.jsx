import { Link } from "react-router-dom";
import {
  FiClock,
  FiDollarSign,
  FiUser,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

const GigCard = ({ gig, showNotificationDot = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isAssigned = gig.status === "assigned";

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-green-500 transition-all duration-200 hover:shadow-lg overflow-hidden">
      {/* Notification Dot */}
      {showNotificationDot && (
        <div className="absolute -top-1 -left-1 z-20">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-600 border-2 border-white shadow-md"></span>
          </span>
        </div>
      )}

      {/* Status */}
      <div
        className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border
          ${
            isAssigned
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-white text-gray-600 border-gray-300"
          }`}
      >
        <FiCheckCircle className="text-xs" />
        {isAssigned ? "Assigned" : "Open"}
      </div>

      {/* Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-green-500 opacity-20 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 pt-10">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors pr-16">
          {gig.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
          {gig.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {/* Budget */}
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center border border-green-200">
              <FiDollarSign className="text-green-700 text-xs" />
            </div>
            <span className="font-semibold text-green-700">
              {gig.budget?.toLocaleString()}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
              <FiClock className="text-gray-500 text-xs" />
            </div>
            <span className="text-gray-500">{formatDate(gig.createdAt)}</span>
          </div>
        </div>

        {/* Bottom: Owner + Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {/* Owner */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <FiUser className="text-white text-xs" />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {gig.ownerId?.name || "Unknown"}
            </span>
          </div>

          {/* CTA */}
          <Link
            to={`/gigs/${gig._id}`}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded-md 
              bg-green-600 hover:bg-green-700
              text-white text-xs font-medium 
              transition-all duration-200 hover:shadow
            "
          >
            View
            <FiArrowRight className="text-xs group-hover:translate-x-[2px] transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GigCard;
