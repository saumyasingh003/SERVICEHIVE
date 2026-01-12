import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  Zap,
  LogOut,
  Briefcase,
  FileText,
  Menu,
  X,
  Bell,
  Home,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const NavButton = ({ to, active, children }) => (
  <Link to={to}>
    <button
      className={`
        relative px-3 py-2 rounded-md flex items-center gap-2 text-sm
        transition
        ${active
          ? "text-green-700 font-semibold"
          : "text-gray-600 hover:text-green-700"}
      `}
    >
      {children}
      {active && (
        <span className="absolute bottom-1 left-2 right-2 h-[2px] bg-green-600 rounded-full" />
      )}
    </button>
  </Link>
);

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-50 
      bg-white/95 backdrop-blur-xl 
      border-b border-gray-200
    ">
      <div className="mx-4 md:mx-8">
        <div className="flex items-center justify-between h-[70px]">
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-xl text-gray-900"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-600 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="tracking-tight">GigFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavButton to="/" active={isActive("/")}>
              <Home className="w-4 h-4" /> Home
            </NavButton>

            <NavButton to="/gigs" active={isActive("/gigs")}>
              <Briefcase className="w-4 h-4" /> Browse Gigs
            </NavButton>

            {isAuthenticated ? (
              <>
                <NavButton to="/post-gig" active={isActive("/post-gig")}>
                  <Plus className="w-4 h-4" /> Post a Gig
                </NavButton>

                <NavButton to="/dashboard" active={isActive("/dashboard")}>
                  <FileText className="w-4 h-4" /> Dashboard
                  {unreadCount > 0 && (
                    <span className="
                      absolute -top-1 -right-2 w-4 h-4 
                      rounded-full bg-green-600 text-white 
                      text-[10px] flex items-center justify-center
                    ">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </NavButton>

                {/* Profile + Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <Avatar className="w-9 h-9 border border-gray-300">
                    <AvatarFallback>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login">
                  <Button variant="ghost" className="hover:text-green-600">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && unreadCount > 0 && (
              <Link to="/dashboard">
                <button className="relative text-gray-700 hover:text-green-700">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </button>
              </Link>
            )}
            <button
              className="text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="py-4 flex flex-col gap-2">
            <NavButton to="/" active={isActive("/")} children={<><Home className="w-4 h-4" /> Home</>} />
            <NavButton to="/gigs" active={isActive("/gigs")} children={<><Briefcase className="w-4 h-4" /> Browse Gigs</>} />

            {isAuthenticated ? (
              <>
                <NavButton to="/post-gig" active={isActive("/post-gig")} children={<><Plus className="w-4 h-4" /> Post a Gig</>} />

                <NavButton to="/dashboard" active={isActive("/dashboard")} children={<><FileText className="w-4 h-4" /> Dashboard</>} />

                <div className="pt-3 mt-2 border-t border-gray-200 px-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-10 h-10 border border-gray-300">
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-200">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
