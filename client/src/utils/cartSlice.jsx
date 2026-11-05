import { createSlice } from "@reduxjs/toolkit";

const loadInitialCart = () => {
  try {
    const saved = localStorage.getItem("swirl_cart");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    items: [],
    restaurantId: null,
    restaurantName: "",
    restaurantLocation: null,
  };
};

const initialCart = loadInitialCart();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: initialCart.items || [],
    restaurantId: initialCart.restaurantId || null,
    restaurantName: initialCart.restaurantName || "",
    restaurantLocation: initialCart.restaurantLocation || null,
  },
  reducers: {
    addItem: (state, action) => {
      const payload = action.payload;
      const incomingItem = payload.item || payload;
      const incomingRestaurantId = payload.restaurantId || incomingItem.restaurantId;
      const incomingRestaurantName = payload.restaurantName || incomingItem.restaurantName;
      const incomingRestaurantLocation = payload.restaurantLocation || incomingItem.restaurantLocation;

      // 1. Cart clears on restaurant switch
      if (
        state.restaurantId &&
        incomingRestaurantId &&
        state.restaurantId !== incomingRestaurantId
      ) {
        state.items = [];
        state.restaurantId = incomingRestaurantId;
        state.restaurantName = incomingRestaurantName || "";
        state.restaurantLocation = incomingRestaurantLocation || null;
      } else if (!state.restaurantId && incomingRestaurantId) {
        state.restaurantId = incomingRestaurantId;
        state.restaurantName = incomingRestaurantName || "";
        state.restaurantLocation = incomingRestaurantLocation || null;
      }

      const info = incomingItem.card?.info || incomingItem;
      const itemId = String(info.id || incomingItem.id);

      // 2. Snapshot price at add time
      const rawPrice = info.price ?? info.defaultPrice ?? incomingItem.price ?? 0;
      const priceSnapshotted =
        rawPrice > 1000 ? rawPrice / 100 : rawPrice > 0 ? rawPrice : 199;

      const variant = payload.variant || incomingItem.variant || "Standard";

      // 3. Find if item already exists in cart with same variant
      const existingItem = state.items.find(
        (it) =>
          String(it.card?.info?.id || it.id) === itemId &&
          it.variant === variant
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        if (existingItem.card?.info) {
          existingItem.card.info.quantity = existingItem.quantity;
        }
      } else {
        // Construct item keeping card.info format intact for ItemList & tests
        const newItem = {
          ...incomingItem,
          id: itemId,
          name: info.name || incomingItem.name,
          priceSnapshotted,
          quantity: payload.quantity || 1,
          variant,
          card: {
            info: {
              ...(incomingItem.card?.info || {}),
              id: itemId,
              name: info.name || incomingItem.name,
              price: priceSnapshotted * 100,
              defaultPrice: priceSnapshotted * 100,
              priceSnapshotted,
              quantity: payload.quantity || 1,
              variant,
              description: info.description || incomingItem.description || "",
              imageId: info.imageId || incomingItem.imageId,
              isVeg: info.isVeg !== undefined ? info.isVeg : incomingItem.isVeg,
            },
          },
        };
        state.items.push(newItem);
      }

      // Persist locally
      try {
        localStorage.setItem(
          "swirl_cart",
          JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
            restaurantName: state.restaurantName,
            restaurantLocation: state.restaurantLocation,
          })
        );
      } catch {
        // ignore storage quota errors
      }
    },

    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(
          (it) => String(it.card?.info?.id || it.id) !== String(itemId)
        );
      } else {
        const item = state.items.find(
          (it) => String(it.card?.info?.id || it.id) === String(itemId)
        );
        if (item) {
          item.quantity = quantity;
          if (item.card?.info) {
            item.card.info.quantity = quantity;
          }
        }
      }

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = "";
        state.restaurantLocation = null;
      }

      try {
        localStorage.setItem(
          "swirl_cart",
          JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
            restaurantName: state.restaurantName,
            restaurantLocation: state.restaurantLocation,
          })
        );
      } catch {
        // ignore
      }
    },

    removeItem: (state) => {
      state.items.pop();
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = "";
        state.restaurantLocation = null;
      }
      try {
        localStorage.setItem(
          "swirl_cart",
          JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
            restaurantName: state.restaurantName,
            restaurantLocation: state.restaurantLocation,
          })
        );
      } catch {
        // ignore
      }
    },

    clearCart: (state) => {
      state.items.length = 0;
      state.restaurantId = null;
      state.restaurantName = "";
      state.restaurantLocation = null;
      try {
        localStorage.removeItem("swirl_cart");
      } catch {
        // ignore
      }
    },

    setCart: (state, action) => {
      const payload = action.payload || {};
      state.items = (payload.items || []).map((it) => {
        if (it.card?.info) return it;
        const price = it.priceSnapshotted || it.price || 0;
        return {
          id: it.itemId || it.id,
          name: it.name,
          priceSnapshotted: price,
          quantity: it.quantity || 1,
          variant: it.variant || "Standard",
          card: {
            info: {
              id: it.itemId || it.id,
              name: it.name,
              price: price * 100,
              defaultPrice: price * 100,
              priceSnapshotted: price,
              quantity: it.quantity || 1,
              variant: it.variant || "Standard",
              description: it.rawItem?.card?.info?.description || "",
              imageId: it.rawItem?.card?.info?.imageId || it.imageUrl,
              isVeg: it.isVeg,
            },
          },
        };
      });
      state.restaurantId = payload.restaurantId || null;
      state.restaurantName = payload.restaurantName || "";
      state.restaurantLocation = payload.restaurantLocation || null;

      try {
        localStorage.setItem(
          "swirl_cart",
          JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
            restaurantName: state.restaurantName,
            restaurantLocation: state.restaurantLocation,
          })
        );
      } catch {
        // ignore
      }
    },
  },
});

export const { addItem, updateItemQuantity, removeItem, clearCart, setCart } =
  cartSlice.actions;

export default cartSlice.reducer;
