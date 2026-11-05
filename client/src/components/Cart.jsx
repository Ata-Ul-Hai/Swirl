import { useSelector, useDispatch } from "react-redux";
import ItemList from "./ItemList.jsx";
import { clearCart, updateItemQuantity } from "../utils/cartSlice";
import { useState, useContext, useEffect } from "react";
import UserContext from "../utils/UserContext";
import api from "../utils/api";
import AuthModal from "./AuthModal";

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((store) => store.cart);
  const cartItems = cart.items || [];
  const { user, isAuthenticated } = useContext(UserContext);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newCity, setNewCity] = useState("New Delhi");
  const [newPincode, setNewPincode] = useState("110001");
  const [quote, setQuote] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClearBtn = () => {
    dispatch(clearCart());
    setQuote(null);
    setPlacedOrder(null);
  };

  // Compute item total using snapshotted prices
  const itemTotal = cartItems.reduce((acc, it) => {
    const price =
      it.priceSnapshotted ||
      (it.card?.info?.price || it.card?.info?.defaultPrice || 0) / 100;
    const qty = it.quantity || 1;
    return acc + price * qty;
  }, 0);

  const userAddresses = user?.addresses || [];
  const activeAddress = userAddresses[selectedAddressIndex] || {
    city: newCity || "New Delhi",
    pincode: newPincode || "110001",
    location: { type: "Point", coordinates: [77.2167, 28.6328] },
  };

  // Recompute server quote using Haversine distance
  useEffect(() => {
    if (cartItems.length === 0) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    const itemsPayload = cartItems.map((it) => ({
      itemId: it.id || it.card?.info?.id,
      name: it.name || it.card?.info?.name,
      priceSnapshotted:
        it.priceSnapshotted ||
        (it.card?.info?.price || it.card?.info?.defaultPrice || 0) / 100,
      quantity: it.quantity || 1,
      variant: it.variant || "Standard",
    }));

    api
      .post("/api/orders/quote", {
        restaurantLocation: cart.restaurantLocation || {
          coordinates: [77.2900505, 28.5488579],
        },
        addressLocation: activeAddress.location || {
          coordinates: [77.2167, 28.6328],
        },
        items: itemsPayload,
      })
      .then((res) => {
        setQuote(res.data?.data);
      })
      .catch(() => {
        // Fallback local calculation
        const distanceKm = 4.2;
        const deliveryFee = 44;
        const taxes = Math.round(itemTotal * 0.05 * 100) / 100;
        setQuote({
          itemTotal,
          deliveryFee,
          taxes,
          distanceKm,
          grandTotal: Math.round((itemTotal + deliveryFee + taxes) * 100) / 100,
        });
      })
      .finally(() => {
        setIsQuoting(false);
      });
  }, [cartItems, selectedAddressIndex, newCity, newPincode, cart.restaurantLocation]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await api.post("/api/orders", {
        restaurant: {
          id: cart.restaurantId || "rest_default",
          name: cart.restaurantName || "Partner Restaurant",
          location: cart.restaurantLocation || {
            type: "Point",
            coordinates: [77.2900505, 28.5488579],
          },
        },
        items: cartItems.map((it) => ({
          itemId: it.id || it.card?.info?.id,
          name: it.name || it.card?.info?.name,
          priceSnapshotted:
            it.priceSnapshotted ||
            (it.card?.info?.price || it.card?.info?.defaultPrice || 0) / 100,
          quantity: it.quantity || 1,
          variant: it.variant || "Standard",
        })),
        deliveryAddress: activeAddress,
      });

      setPlacedOrder(response.data?.data);
      dispatch(clearCart());
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "Failed to place order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Clear Cart Header */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-2xl">Cart</h1>
        {cart.restaurantName && (
          <p className="text-sm font-semibold text-orange-600 mt-1">
            Restaurant: {cart.restaurantName}
          </p>
        )}
        <button
          className="border border-solid border-black rounded-xl px-2 m-2 hover:cursor-pointer bg-red-400 text-white font-medium hover:bg-red-500 transition-colors"
          onClick={handleClearBtn}
        >
          Clear Cart
        </button>
      </div>

      {/* Order Confirmed Banner with Status History */}
      {placedOrder && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 mb-8 text-left">
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-xl font-bold">Order Placed Successfully!</h2>
              <p className="text-xs text-gray-500">
                Order ID: {placedOrder.id || placedOrder._id}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order Status History (Enum)
            </h3>
            <div className="flex flex-col gap-2">
              {(placedOrder.statusHistory || []).map((sh, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="font-semibold uppercase text-xs text-gray-800">
                    {sh.status.replace(/_/g, " ")}:
                  </span>
                  <span className="text-gray-600">{sh.note}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(sh.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600 border-t border-gray-100 pt-3 flex justify-between">
            <span>
              Delivering to: {placedOrder.deliveryAddress?.city} (
              {placedOrder.deliveryAddress?.pincode})
            </span>
            <span className="font-bold text-gray-900">
              Paid: ₹{placedOrder.grandTotal}
            </span>
          </div>
        </div>
      )}

      {/* Main Cart Items Section */}
      <div className="w-full md:w-10/12 m-auto">
        <ItemList data={cartItems} />

        {/* Empty state messages */}
        {cartItems.length === 0 && !placedOrder && (
          <div className="text-center py-6">
            <h1>Cart is empty</h1>
            <h1>Add Items to the cart!</h1>
          </div>
        )}

        {/* Quantity Controls & Snapshotted Pricing Badges */}
        {cartItems.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">
              Item Details & Quantity Controls:
            </h3>
            <div className="flex flex-col gap-2">
              {cartItems.map((item) => {
                const info = item.card?.info || item;
                const id = info.id || item.id;
                const qty = item.quantity || 1;
                const price =
                  item.priceSnapshotted ||
                  (info.price || info.defaultPrice || 0) / 100;

                return (
                  <div
                    key={id}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{info.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Snapshotted: ₹{price} • Variant: {item.variant || "Standard"})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                          onClick={() =>
                            dispatch(
                              updateItemQuantity({
                                itemId: id,
                                quantity: qty - 1,
                              })
                            )
                          }
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-semibold text-xs">
                          {qty}
                        </span>
                        <button
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 font-bold"
                          onClick={() =>
                            dispatch(
                              updateItemQuantity({
                                itemId: id,
                                quantity: qty + 1,
                              })
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-gray-800 w-16 text-right">
                        ₹{Math.round(price * qty)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout: Address & Price Breakdown Card */}
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Checkout & Delivery Details
              </h2>

              {/* Address Picker */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Pick Delivery Address
                </label>
                {userAddresses.length > 0 ? (
                  <select
                    value={selectedAddressIndex}
                    onChange={(e) =>
                      setSelectedAddressIndex(Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                  >
                    {userAddresses.map((addr, idx) => (
                      <option key={idx} value={idx}>
                        {addr.city} - {addr.pincode}
                        {addr.street ? ` (${addr.street})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="border-t border-gray-100 pt-4 mb-6 text-sm text-gray-600 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-semibold text-gray-900">
                    ₹{quote ? quote.itemTotal : itemTotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Delivery Partner Fee (
                    {quote?.distanceKm || 3.5} km via Haversine)
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{quote ? quote.deliveryFee : 30}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Charges (5% GST)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{quote ? quote.taxes : Math.round(itemTotal * 0.05)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base text-gray-900">
                  <span>Grand Total (Frozen Prices)</span>
                  <span className="text-orange-600">
                    ₹
                    {quote
                      ? quote.grandTotal
                      : itemTotal + 30 + Math.round(itemTotal * 0.05)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isQuoting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-base"
              >
                {isPlacingOrder
                  ? "Placing Order..."
                  : !isAuthenticated
                  ? "Log in to Checkout"
                  : `Place Order • ₹${quote ? quote.grandTotal : itemTotal}`}
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Cart;
