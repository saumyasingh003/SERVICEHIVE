import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gigAPI } from "../api";
import { useNotification } from "../context/NotificationContext";
import toast from "react-hot-toast";
import {
  FiDollarSign,
  FiFileText,
  FiSend,
  FiArrowLeft,
  FiBriefcase,
} from "react-icons/fi";

const PostGig = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await gigAPI.create({
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
      });
      success(
        "Your gig has been posted and is now visible to freelancers!",
        "Gig Posted"
      );
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="relative w-full px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-md">
            <FiBriefcase className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            Post a New <span className="text-green-600">Gig</span>
          </h1>
          <p className="text-sm text-gray-600">
            Describe your project and connect with freelancers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Gig Title *
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Build a responsive website"
                  required
                  minLength={5}
                  maxLength={100}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">5-100 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project, timeline, and skills needed..."
                required
                minLength={20}
                maxLength={2000}
                rows={5}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length}/2000 (min 20)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Budget (USD) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter your budget"
                  required
                  min={1}
                  max={1000000}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-800 mb-2">
                💡 Tips for a great post
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Be specific about requirements</li>
                <li>• Include timeline and deadlines</li>
                <li>• Set a realistic budget</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-all"
              >
                <FiArrowLeft className="text-sm" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md transition-all disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSend className="text-sm" />
                    Post Gig
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostGig;
