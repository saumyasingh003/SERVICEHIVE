import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowRight,
  FiBriefcase,
  FiUsers,
  FiDollarSign,
  FiShield,
  FiPlay,
} from "react-icons/fi";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FiBriefcase,
      title: "Post Gigs Easily",
      description:
        "Create project listings in minutes and reach talented freelancers.",
    },
    {
      icon: FiUsers,
      title: "Quality Freelancers",
      description:
        "Connect with verified professionals across various industries.",
    },
    {
      icon: FiDollarSign,
      title: "Competitive Pricing",
      description: "Receive multiple bids and choose the best value.",
    },
    {
      icon: FiShield,
      title: "Secure Payments",
      description: "Protected transactions ensure your money is safe.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Gigs" },
    { value: "25K+", label: "Freelancers" },
    { value: "98%", label: "Success Rate" },
    { value: "$5M+", label: "Paid Out" },
  ];

  const steps = [
    {
      step: "01",
      title: "Post Your Gig",
      desc: "Describe your project and set budget",
    },
    {
      step: "02",
      title: "Receive Bids",
      desc: "Get proposals from freelancers",
    },
    {
      step: "03",
      title: "Hire & Collaborate",
      desc: "Choose the best fit and start",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white pt-20">
        <div className="relative w-full px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Find Talent.{" "}
              <span className="text-green-600">Get Work Done.</span>
              <br />
              <span className="text-gray-800">Grow Together.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-8">
              The premier marketplace connecting businesses with skilled freelancers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? "/post-gig" : "/register"}
                className="group flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                {isAuthenticated ? "Post a Gig" : "Get Started Free"}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/gigs"
                className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg shadow-sm transition-all"
              >
                <FiPlay className="text-sm" />
                Browse Gigs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-green-700">
        <div className="w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <p className="text-3xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="w-full px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-2">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Everything You Need to Succeed
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Our platform provides all the tools you need to connect and collaborate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-xl text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-2">
              Simple Process
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">
              How GigFlow Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, idx) => (
              <div key={idx} className="text-center relative">
                <div className="w-14 h-14 mx-auto mb-4 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg font-extrabold">{item.step}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-green-800 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Start?</h2>
        <p className="text-white/90 mb-8 max-w-lg mx-auto">
          Join thousands of creators and businesses using GigFlow.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="group px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-md"
          >
            Create Free Account
          </Link>
          <Link
            to="/gigs"
            className="px-6 py-3 border border-white/50 hover:bg-white/10 rounded-lg font-semibold transition-all"
          >
            Explore Gigs
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
