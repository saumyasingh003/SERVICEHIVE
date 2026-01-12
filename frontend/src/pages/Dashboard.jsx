import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { gigsAPI, bidsAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import GigCard from "../components/GigCard";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Briefcase,
  MessageSquare,
  Plus,
  Loader,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Bell,
  X,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, clearNotifications, markAsRead } =
    useSocket();
  const [activeTab, setActiveTab] = useState("my-gigs");
  const [myGigs, setMyGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch both gigs and bids on initial load
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      console.log("📊 Dashboard: Fetching gigs and bids...");
      try {
        const [gigsRes, bidsRes] = await Promise.all([
          gigsAPI.getMyGigs(),
          bidsAPI.getMyBids(),
        ]);
        console.log("📊 Gigs Response:", gigsRes.data);
        console.log("📊 Bids Response:", bidsRes.data);

        if (gigsRes.data.success) {
          setMyGigs(gigsRes.data.gigs);
          console.log("✅ Gigs loaded:", gigsRes.data.gigs.length);
        }
        if (bidsRes.data.success) {
          setMyBids(bidsRes.data.bids);
          console.log("✅ Bids loaded:", bidsRes.data.bids.length);
        }
      } catch (e) {
        console.error("❌ Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const fetchMyGigs = async () => {
    try {
      const r = await gigsAPI.getMyGigs();
      if (r.data.success) setMyGigs(r.data.gigs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMyBids = async () => {
    try {
      const r = await bidsAPI.getMyBids();
      if (r.data.success) setMyBids(r.data.bids);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusVariant = (s) =>
    s === "hired" ? "success" : s === "rejected" ? "destructive" : "warning";
  const getStatusIcon = (s) =>
    s === "hired" ? (
      <CheckCircle className="w-3.5 h-3.5" />
    ) : s === "rejected" ? (
      <XCircle className="w-3.5 h-3.5" />
    ) : (
      <Clock className="w-3.5 h-3.5" />
    );
  const formatPrice = (p) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(p);

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const stats = [
    {
      label: "My Gigs",
      value: myGigs.length,
      icon: <Briefcase className="w-6 h-6" />,
      bg: "bg-gray-100",
      text: "text-gray-700",
    },
    {
      label: "Open Gigs",
      value: myGigs.filter((g) => g.status === "open").length,
      icon: <TrendingUp className="w-6 h-6" />,
      bg: "bg-green-100",
      text: "text-green-600",
    },
    {
      label: "Total Bids",
      value: myBids.length,
      icon: <MessageSquare className="w-6 h-6" />,
      bg: "bg-gray-100",
      text: "text-gray-700",
    },
    {
      label: "Hired",
      value: myBids.filter((b) => b.status === "hired").length,
      icon: <CheckCircle className="w-6 h-6" />,
      bg: "bg-green-100",
      text: "text-green-700",
    },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-[calc(100vh-72px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mt-20">
        <div className="px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border border-gray-300">
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 text-base md:text-lg mt-1">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Top Right Buttons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="outline"
                  className="gap-2 h-12 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                      {notifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearNotifications}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !n.read ? "bg-green-50" : ""
                            }`}
                            onClick={() => markAsRead(n.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  n.type === "hired"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {n.type === "hired" ? "🎉" : "📩"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {n.title}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  {n.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTime(n.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/post-gig">
                <Button className="gap-2 h-12 px-6 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-5 h-5" />
                  Post New Gig
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-6 py-6 space-y-6">
        {/* Hired Banner */}
        {notifications.filter((n) => n.type === "hired" && !n.read).length >
          0 && (
          <Card className="border border-green-300 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  🎉
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-700">
                    Congratulations! You've Been Hired!
                  </h3>
                  <p className="text-green-700">
                    {
                      notifications.find((n) => n.type === "hired" && !n.read)
                        ?.message
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    const hiredNotifs = notifications.filter(
                      (n) => n.type === "hired" && !n.read
                    );
                    hiredNotifs.forEach((n) => markAsRead(n.id));
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((s, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="flex items-center gap-4 md:gap-5 p-5 md:p-6">
                <div
                  className={`w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center ${s.text}`}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {s.value}
                  </p>
                  <p className="text-sm md:text-base text-gray-600">
                    {s.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto h-12 bg-white border border-gray-200">
            <TabsTrigger
              value="my-gigs"
              className="gap-2 flex-1 sm:flex-none h-10 px-6 data-[state=active]:text-green-700 data-[state=active]:font-semibold"
            >
              <Briefcase className="w-4 h-4" />
              My Gigs
            </TabsTrigger>
            <TabsTrigger
              value="my-bids"
              className="gap-2 flex-1 sm:flex-none h-10 px-6 data-[state=active]:text-green-700 data-[state=active]:font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              My Bids
            </TabsTrigger>
          </TabsList>

          {/* My Gigs */}
          <TabsContent value="my-gigs" className="mt-8">
            {loading ? (
              <div className="loading-container">
                <Loader className="w-10 h-10 animate-spin text-green-600" />
              </div>
            ) : myGigs.length === 0 ? (
              <div className="empty-state text-center text-gray-600 space-y-3">
                <Briefcase className="w-10 h-10 mx-auto opacity-50" />
                <h3 className="font-semibold text-gray-800">
                  No gigs posted yet
                </h3>
                <p>Start by posting your first gig</p>
                <Link to="/post-gig">
                  <Button className="gap-2 h-11 bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4" />
                    Post Your First Gig
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {myGigs.map((g) => (
                  <GigCard key={g._id} gig={g} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Bids */}
          <TabsContent value="my-bids" className="mt-8">
            {loading ? (
              <div className="loading-container">
                <Loader className="w-10 h-10 animate-spin text-green-600" />
              </div>
            ) : myBids.length === 0 ? (
              <div className="empty-state text-center text-gray-600 space-y-3">
                <MessageSquare className="w-10 h-10 mx-auto opacity-50" />
                <h3 className="font-semibold text-gray-800">No bids yet</h3>
                <p>Browse available gigs</p>
                <Link to="/gigs">
                  <Button className="h-11 bg-green-600 hover:bg-green-700 text-white">
                    Browse Gigs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-5">
                {myBids.map((b) => (
                  <Link key={b._id} to={`/gigs/${b.gigId?._id}`}>
                    <Card
                      className={`border border-gray-200 transition-colors hover:border-green-500 ${
                        b.status === "hired"
                          ? "ring-2 ring-green-500 bg-green-50"
                          : ""
                      }`}
                    >
                      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg truncate">
                            {b.gigId?.title || "Deleted Gig"}
                          </h4>
                          <p className="text-gray-500 truncate mt-1">
                            {b.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                          <div className="flex items-center gap-1.5 text-lg md:text-xl font-semibold text-green-700">
                            <DollarSign className="w-5 h-5" />
                            {formatPrice(b.price)}
                          </div>

                          <Badge
                            variant={getStatusVariant(b.status)}
                            className="gap-1.5 py-1 px-3 capitalize"
                          >
                            {getStatusIcon(b.status)}
                            {b.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
