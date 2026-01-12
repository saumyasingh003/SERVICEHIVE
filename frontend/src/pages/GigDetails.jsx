import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gigsAPI, bidsAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import BidCard from "../components/BidCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  Loader,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [bidForm, setBidForm] = useState({ message: "", price: "" });

  const isOwner = user && gig && gig.ownerId?._id === user._id;
  const isAssigned = gig?.status === "assigned";
  const isOpen = gig?.status === "open";

  useEffect(() => {
    fetchGig();
  }, [id]);

  useEffect(() => {
    if (isOwner && gig) fetchBids();
  }, [isOwner, gig]);

  const fetchGig = async () => {
    setLoading(true);
    try {
      const r = await gigsAPI.getById(id);
      if (r.data.success) setGig(r.data.gig);
    } catch (e) {
      toast.error("Failed to load gig");
      navigate("/gigs");
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    setBidsLoading(true);
    try {
      const r = await bidsAPI.getForGig(id);
      if (r.data.success) setBids(r.data.bids);
    } catch (e) {
      console.error(e);
    } finally {
      setBidsLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) return navigate("/login");
    if (isOwner) return toast.error("You cannot bid on your own gig");
    if (isAssigned) return toast.error("This gig is already assigned");

    setSubmitting(true);
    try {
      const r = await bidsAPI.create({
        gigId: id,
        message: bidForm.message,
        price: Number(bidForm.price),
      });
      if (r.data.success) {
        toast.success("Bid submitted!");
        setBidForm({ message: "", price: "" });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    setHiring(true);
    try {
      const r = await bidsAPI.hire(bidId);
      if (r.data.success) {
        toast.success("Freelancer hired!");
        fetchGig();
        fetchBids();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to hire");
    } finally {
      setHiring(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatBudget = (b) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(b);

  if (loading)
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-gray-600">
        <Loader className="w-10 h-10 animate-spin text-green-600" />
        <p className="mt-2">Loading gig details...</p>
      </div>
    );

  if (!gig)
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center text-center">
        <div className="space-y-4">
          <AlertCircle className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="font-semibold text-gray-800 text-lg">Gig Not Found</h3>
          <Button onClick={() => navigate("/gigs")} className="bg-green-600 hover:bg-green-700 text-white">
            Browse Gigs
          </Button>
        </div>
      </div>
    );

  return (
    <div className="w-full bg-gray-50 min-h-[calc(100vh-72px)] mt-4">
      <div className="px-4 md:px-6 py-10 md:py-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 gap-2 h-11">
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border border-gray-200">
              <CardHeader className="p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <Badge
                    variant={isOpen ? "success" : "secondary"}
                    className={`gap-1.5 py-1.5 px-4 text-sm capitalize ${
                      isOpen
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-200 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Open for Bids
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Assigned
                      </>
                    )}
                  </Badge>

                  <div className="flex items-center gap-1 text-2xl md:text-3xl font-bold text-green-600">
                    {/* <DollarSign className="w-7 h-7" /> */}
                    {formatBudget(gig.budget)}
                  </div>
                </div>

                <CardTitle className="text-2xl md:text-3xl text-gray-900">
                  {gig.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0 space-y-8 text-gray-700">
                {/* Meta */}
                <div className="flex flex-wrap gap-6 text-base text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Posted by {gig.ownerId?.name || "Anonymous"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {formatDate(gig.createdAt)}
                  </div>
                </div>

                <section>
                  <h3 className="font-semibold text-gray-800 text-lg mb-4">
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {gig.description}
                  </p>
                </section>

                {/* Assigned info */}
                {isAssigned && gig.hiredFreelancerId && (
                  <div className="bg-green-50 border border-green-300 rounded-xl p-6">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-4 text-lg">
                      <CheckCircle className="w-6 h-6" />
                      Hired Freelancer
                    </h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border border-gray-200">
                        <AvatarFallback className="text-lg">
                          {gig.hiredFreelancerId.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800 text-lg">
                          {gig.hiredFreelancerId.name}
                        </p>
                        <p className="text-gray-600">
                          {gig.hiredFreelancerId.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bid form */}
            {!isOwner && isOpen && (
              <Card className="border border-gray-200">
                <CardHeader className="p-6 md:p-8">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                    <MessageSquare className="w-6 h-6" /> Submit Your Bid
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 md:p-8 pt-0">
                  {!isAuthenticated ? (
                    <div className="text-center py-10">
                      <p className="text-gray-600 mb-5">Please login to submit a bid</p>
                      <Button className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/login")}>
                        Login
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base text-gray-800">Your Proposal</Label>
                        <Textarea
                          value={bidForm.message}
                          onChange={(e) =>
                            setBidForm({ ...bidForm, message: e.target.value })
                          }
                          placeholder="Describe why you're the best fit..."
                          rows={6}
                          className="min-h-[150px]"
                          required
                          minLength={10}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base text-gray-800">Your Price ($)</Label>
                        <div className="relative">
                          {/* <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                          <Input
                            type="number"
                            value={bidForm.price}
                            onChange={(e) =>
                              setBidForm({ ...bidForm, price: e.target.value })
                            }
                            placeholder="Enter your price"
                            className="pl-12 h-12"
                            required
                            min={1}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Bid"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Closed gig */}
            {!isOwner && isAssigned && (
              <Card className="border border-gray-300 bg-gray-50">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">
                    This Gig Has Been Assigned
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Browse other open gigs to find new opportunities.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/gigs")}
                    className="h-11 px-6 border-gray-400 text-gray-700 hover:bg-gray-100"
                  >
                    Browse Open Gigs
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Owner sidebar */}
          {isOwner && (
            <div className="lg:col-span-1">
              <Card className="sticky top-[100px] border border-gray-200">
                <CardHeader className="p-6 md:p-8">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                    <MessageSquare className="w-6 h-6" />
                    Bids Received ({bids.length})
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 md:p-8 pt-0">
                  {bidsLoading ? (
                    <div className="py-10 flex justify-center">
                      <Loader className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : bids.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">
                      No bids yet. Share your gig!
                    </p>
                  ) : (
                    <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                      {bids.map((bid) => (
                        <BidCard
                          key={bid._id}
                          bid={bid}
                          isOwner={isOwner}
                          onHire={handleHire}
                          hiring={hiring}
                          gigStatus={gig.status}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
