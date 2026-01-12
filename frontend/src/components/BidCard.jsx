import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const BidCard = ({ bid, isOwner, onHire, hiring, gigStatus }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);

  const getStatusStyles = (status) => {
    switch (status) {
      case "hired":
        return "bg-green-50 text-green-700 border border-green-300";
      case "rejected":
        return "bg-gray-50 text-gray-500 border border-gray-200";
      default:
        return "bg-white text-gray-700 border border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "hired":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "rejected":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const isHired = bid.status === "hired";
  const isRejected = bid.status === "rejected";
  const isPending = bid.status === "pending";
  const canHire = isOwner && isPending && gigStatus === "open";

  return (
    <Card
      className={`rounded-xl border border-gray-200 transition 
        ${isHired ? "border-green-400 bg-green-50/40" : ""}
        ${isRejected ? "opacity-80" : ""}`}
    >
      <CardHeader className="px-5 py-4">
        <div className="flex items-start justify-between">
      
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-gray-300 bg-white">
              <AvatarFallback className="text-sm font-medium">
                {bid.freelancerId?.name?.charAt(0)?.toUpperCase() ?? "F"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">
                {bid.freelancerId?.name ?? "Freelancer"}
              </p>
              <p className="text-xs text-gray-500">
                {bid.freelancerId?.email}
              </p>
            </div>
          </div>

          
          <Badge
            className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs ${getStatusStyles(
              bid.status
            )}`}
          >
            {getStatusIcon(bid.status)}
            <span className="capitalize font-medium">{bid.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-gray-700 text-sm leading-relaxed">
              {bid.message}
            </p>
          </div>
        </div>

  
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-lg font-semibold text-green-600">
            {/* <DollarSign className="w-5 h-5" /> */}
            <span>{formatPrice(bid.price)}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(bid.createdAt)}</span>
          </div>
        </div>


        {canHire && (
          <Button
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white w-full h-10 rounded-md"
            onClick={() => onHire(bid._id)}
            disabled={hiring}
          >
            {hiring ? "Hiring..." : "Hire Freelancer"}
          </Button>
        )}

        
        {isHired && (
          <p className="text-center text-sm bg-green-100 text-green-700 rounded-md py-2 font-medium">
            ✓ Freelancer hired
          </p>
        )}

        {isRejected && (
          <p className="text-center text-sm text-gray-500 bg-gray-100 rounded-md py-2">
            Bid rejected
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BidCard;
