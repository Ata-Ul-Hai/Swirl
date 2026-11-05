import { useState, useEffect, useContext } from "react";
import UserContext from "../utils/UserContext";
import api from "../utils/api";
import { getSocket } from "../utils/socket";

function RestaurantPanel() {
  const { user, login } = useContext(UserContext);
  const [restaurantId, setRestaurantId] = useState(
    user?.restaurantId || "368180"
  );
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "menu"
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPrepTime, setSelectedPrepTime] = useState(25);

  // Owner credentials state for quick login
  const [ownerEmail, setOwnerEmail] = useState("owner@swirl.com");
  const [ownerPassword, setOwnerPassword] = useState("password123");
  const [loginError, setLoginError] = useState("");

  const isOwner =
    user && (user.role === "RestaurantOwner" || user.role === "Admin");

  // Load orders when authenticated as owner
  useEffect(() => {
    if (!isOwner) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/restaurant/${restaurantId}/orders`);
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch live orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Socket.io for live "new order" popup & status updates
    const socket = getSocket();
    if (socket) {
      socket.emit("join_restaurant", restaurantId);

      const handleNewOrder = (data) => {
        setNewOrderAlert(data);
        // Prepend to orders list
        setOrders((prev) => [data, ...prev]);

        // Auto-dismiss alert after 6s
        setTimeout(() => setNewOrderAlert(null), 6000);
      };

      const handleStatusUpdate = (data) => {
        setOrders((prev) =>
          prev.map((ord) =>
            String(ord.id || ord._id) === String(data.orderId)
              ? { ...ord, status: data.status, prepTimeMinutes: data.prepTimeMinutes }
              : ord
          )
        );
      };

      socket.on("new_order", handleNewOrder);
      socket.on("order_status_updated", handleStatusUpdate);

      return () => {
        socket.off("new_order", handleNewOrder);
        socket.off("order_status_updated", handleStatusUpdate);
      };
    }
  }, [isOwner, restaurantId]);

  const handleOwnerLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      // If owner account doesn't exist yet, attempt signup as RestaurantOwner
      try {
        await api.post("/api/auth/signup", {
          name: "Pizza Hut Manager",
          email: ownerEmail,
          password: ownerPassword,
          role: "RestaurantOwner",
          restaurantId,
        });
      } catch (signupErr) {
        // Ignore duplicate error if already created
      }

      await login(ownerEmail, ownerPassword);
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message);
    }
  };

  const handleAccept = async (orderId) => {
    try {
      const res = await api.patch(
        `/api/restaurant/${restaurantId}/orders/${orderId}/accept`,
        { prepTimeMinutes: selectedPrepTime }
      );
      setOrders((prev) =>
        prev.map((o) => (String(o.id || o._id) === String(orderId) ? res.data?.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept order");
    }
  };

  const handleReject = async (orderId) => {
    try {
      const res = await api.patch(
        `/api/restaurant/${restaurantId}/orders/${orderId}/reject`,
        { reason: "Kitchen is at full capacity" }
      );
      setOrders((prev) =>
        prev.map((o) => (String(o.id || o._id) === String(orderId) ? res.data?.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject order");
    }
  };

  const handleUpdatePrepTime = async (orderId, mins) => {
    try {
      const res = await api.patch(
        `/api/restaurant/${restaurantId}/orders/${orderId}/prep-time`,
        { prepTimeMinutes: mins }
      );
      setOrders((prev) =>
        prev.map((o) => (String(o.id || o._id) === String(orderId) ? res.data?.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update prep time");
    }
  };

  const handleToggleStock = async (itemId, inStock) => {
    try {
      await api.patch(
        `/api/restaurant/${restaurantId}/menu/items/${itemId}/toggle`,
        { inStock: !inStock }
      );
      alert(`Item is now ${!inStock ? "In Stock" : "Out of Stock"}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle stock");
    }
  };

  // If not logged in as owner, show Owner Login portal
  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏪 Restaurant Owner Portal
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Log in with your restaurant owner credentials to manage live orders and menu availability.
        </p>

        {loginError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
            {loginError}
          </div>
        )}

        <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Restaurant ID
            </label>
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Owner Email
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
          >
            Access Restaurant Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Live "New Order" Popup */}
      {newOrderAlert && (
        <div className="fixed top-5 right-5 z-50 bg-orange-600 text-white p-5 rounded-2xl shadow-2xl border-2 border-white animate-bounce max-w-sm">
          <div className="flex items-center gap-2 font-bold text-lg mb-1">
            <span>🔔</span> NEW ORDER RECEIVED!
          </div>
          <p className="text-sm">
            Total: ₹{newOrderAlert.grandTotal} • {newOrderAlert.items?.length} items
          </p>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="mt-2 text-xs bg-white text-orange-600 font-bold px-3 py-1 rounded-full cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              🏪 Restaurant Control Panel
            </h1>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Socket Connected
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Managing Restaurant: <span className="font-bold text-gray-800">{restaurantId}</span> (Owner: {user.name})
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "orders"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Live Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "menu"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Item Availability
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="flex flex-col gap-4">
          {loading && <p className="text-center text-gray-500">Loading live orders...</p>}
          {!loading && orders.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
              No live orders at the moment. Keep this page open; new orders will pop up in real time!
            </div>
          )}

          {orders.map((ord) => {
            const ordId = ord.id || ord._id;
            return (
              <div
                key={ordId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-base text-gray-900">
                      Order #{ordId.slice(-6)}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                        ord.status === "placed"
                          ? "bg-yellow-100 text-yellow-800"
                          : ord.status === "confirmed" || ord.status === "preparing"
                          ? "bg-blue-100 text-blue-800"
                          : ord.status === "out_for_delivery"
                          ? "bg-purple-100 text-purple-800"
                          : ord.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ord.status.replace(/_/g, " ")}
                    </span>
                    {ord.prepTimeMinutes && (
                      <span className="text-xs text-gray-500 font-medium">
                        ⏱ Prep: {ord.prepTimeMinutes} mins
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-gray-800">
                      Items ({(ord.items || []).length}):
                    </span>{" "}
                    {(ord.items || [])
                      .map((it) => `${it.name} x${it.quantity} (₹${it.priceSnapshotted})`)
                      .join(", ")}
                  </div>

                  <div className="text-xs text-gray-500">
                    Delivering to: {ord.deliveryAddress?.city} • Grand Total:{" "}
                    <span className="font-bold text-gray-900">₹{ord.grandTotal}</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {ord.status === "placed" && (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500">
                          Prep:
                        </label>
                        <select
                          value={selectedPrepTime}
                          onChange={(e) => setSelectedPrepTime(Number(e.target.value))}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value={15}>15 mins</option>
                          <option value={25}>25 mins</option>
                          <option value={35}>35 mins</option>
                          <option value={45}>45 mins</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(ordId)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(ordId)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </>
                  )}

                  {(ord.status === "confirmed" || ord.status === "preparing") && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleUpdatePrepTime(ordId, 15)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold py-1.5 rounded-lg text-xs"
                      >
                        ⏱ Update Prep Time (15m)
                      </button>
                      <button
                        onClick={() => api.patch(`/api/orders/${ordId}/status`, { status: "out_for_delivery" })}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        🚚 Out for Delivery
                      </button>
                    </div>
                  )}

                  {ord.status === "out_for_delivery" && (
                    <button
                      onClick={() => api.patch(`/api/orders/${ordId}/status`, { status: "delivered" })}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                    >
                      ✓ Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === "menu" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Toggle Menu Item Availability
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Instantly turn items In-Stock or Out-of-Stock for customers. Changes propagate live.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { id: "item_pizza_1", name: "Margherita Pizza", inStock: true },
              { id: "item_pizza_2", name: "Farmhouse Loaded Pizza", inStock: true },
              { id: "item_pizza_3", name: "Garlic Breadsticks", inStock: true },
              { id: "item_pizza_4", name: "Choco Lava Cake", inStock: false },
            ].map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{it.name}</h4>
                  <span className="text-xs text-gray-400">ID: {it.id}</span>
                </div>
                <button
                  onClick={() => handleToggleStock(it.id, it.inStock)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    it.inStock
                      ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                      : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
                  }`}
                >
                  {it.inStock ? "In Stock (Click to Disable)" : "Out of Stock (Click to Enable)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantPanel;
