import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiHeart,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
    ],
    resources: [
      { label: "Blog", to: "/blog" },
      { label: "Help", to: "/help" },
    ],
    legal: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      <div className="w-full px-4 md:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <FiBriefcase className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900 tracking-tight">
                ServiceHive
              </span>
            </Link>

            <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-xs">
              Connect with top talent or find your next opportunity.
            </p>

            <div className="flex items-center gap-2">
              {[FiTwitter, FiLinkedin, FiGithub].map((Icon, i) => (
                <a
                  href="#"
                  key={i}
                  className="
                    w-8 h-8 border border-gray-300 hover:border-green-600
                    text-gray-600 hover:text-green-700 rounded-md 
                    flex items-center justify-center transition-colors
                  "
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                {section}
              </h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-gray-600 hover:text-green-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">© {currentYear} ServiceHive</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <FiHeart className="text-green-600" /> for freelancers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
