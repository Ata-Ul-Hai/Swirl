import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "../utils/api";
import { getSocket } from "../utils/socket";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: "📝" },
  { key: "confirmed", label: "Confirmed", icon: "👍" },
  { key: "preparing", label: "Preparing Food", icon: "🍳" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

function OrderTracker() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Fetch initial order details
    api
      .get(`/api/orders/${id}`)
      .then((res) => {
        setOrder(res.data?.data);
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Connect to Socket.io room for this order
    const socket = getSocket();
    if (socket) {
      socket.emit("join_order", id);
      setSocketConnected(true);

      const handleStatusUpdate = (update) => {
        if (String(update.orderId) === String(id)) {
          setOrder((prev) => ({
            ...prev,
            status: update.status,
            prepTimeMinutes: update.prepTimeMinutes ?? prev?.prepTimeMinutes,
            statusHistory: update.statusHistory || prev?.statusHistory,
          }));
        }
      };

      socket.on("order_status_updated", handleStatusUpdate);

      return () => {
        socket.off("order_status_updated", handleStatusUpdate);
      };
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-gray-500">
        Loading live order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <Link to="/" className="text-orange-500 hover:underline mt-2 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Live Badge & Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Live Order Tracker
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
              Order #{String(order.id || order._id).slice(-6)}
            </h1>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              socketConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            {socketConnected ? "Live Updates Active" : "Polling"}
          </span>
        </div>

        {order.prepTimeMinutes && !isCancelled && order.status !== "delivered" && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">⏱</span>
            <div>
              <div className="font-bold text-sm">Estimated Prep Time: {order.prepTimeMinutes} mins</div>
              <div className="text-xs text-orange-700">The restaurant is preparing your fresh meal!</div>
            </div>
          </div>
        )}

        {/* Stepper Progress Bar */}
        {!isCancelled ? (
          <div className="py-4">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-sm ${
                        isCurrent
                          ? "bg-orange-500 text-white ring-4 ring-orange-100 scale-110"
                          : isPassed
                          ? "bg-green-600 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium text-center ${
                        isCurrent
                          ? "text-orange-600 font-bold"
                          : isPassed
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center font-bold">
            ❌ Order was cancelled by the restaurant
          </div>
        )}
      </div>

      {/* Order Details & Status History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-base mb-3">Order Items</h3>
          <div className="divide-y divide-gray-100">
            {(order.items || []).map((it, idx) => (
              <div key={idx} className="py-2.5 flex justify-between text-sm">
                <span>
                  {it.name} <span className="text-gray-500 font-semibold">x{it.quantity}</span>
                </span>
                <span className="font-bold text-gray-900">₹{it.subtotal || it.priceSnapshotted * it.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-base text-gray-900">
            <span>Grand Total</span>
            <span className="text-orange-600">₹{order.grandTotal}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-base mb-3">Status Timeline</h3>
          <div className="flex flex-col gap-3">
            {(order.statusHistory || []).map((hist, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900 uppercase">
                    {hist.status.replace(/_/g, " ")}
                  </div>
                  <div className="text-gray-500">{hist.note}</div>
                  <div className="text-gray-400 text-[10px]">
                    {new Date(hist.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracker;
