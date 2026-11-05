import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const seedPath = path.resolve(process.cwd(), "server/data/restaurants.json");
    let target = null;
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, "utf8");
      const list = JSON.parse(raw);
      target = list.find((r) => String(r.id || r._id) === String(id));
    }

    if (!target) {
      target = {
        name: "Swirl Partner Kitchen",
        cuisines: ["North Indian", "Fast Food", "Beverages"],
        costForTwoMessage: "₹350 for two",
        avgRatingString: "4.2",
      };
    }

    const categories = [
      {
        card: {
          card: {
            "@type": "type.googleapis.com/swiggy.presentation.food.v2.ItemCategory",
            title: "Recommended",
            itemCards: (target.menuItems && target.menuItems.length > 0 ? target.menuItems : [
              {
                id: "101",
                name: "Classic Paneer Butter Masala",
                price: 280,
                isVeg: true,
                description: "Rich creamy cottage cheese cooked in tomato butter gravy.",
              },
              {
                id: "102",
                name: "Butter Naan (2 Pcs)",
                price: 90,
                isVeg: true,
                description: "Crispy freshly baked clay oven flatbread with butter.",
              },
            ]).map((item) => ({
              card: {
                info: {
                  id: String(item.id || item._id),
                  name: item.name,
                  category: item.category || "Recommended",
                  description: item.description || "",
                  price: (item.price || 200) * 100,
                  defaultPrice: (item.price || 200) * 100,
                  imageId: item.imageId || "",
                  imageUrl: item.imageUrl || "",
                  itemAttribute: {
                    vegClassifier: item.isVeg ? "VEG" : "NONVEG",
                  },
                  inStock: item.inStock ?? true,
                },
              },
            })),
          },
        },
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        restaurantInfo: {
          id: String(id),
          name: target.name,
          cuisines: target.cuisines || [],
          costForTwoMessage: target.costForTwo || target.costForTwoMessage || "₹350 for two",
          avgRatingString: target.avgRatingString || String(target.rating || "4.2"),
          totalRatingsString: target.totalRatingsString || "1K+",
        },
        categories,
      },
    });
  } catch (err) {
    console.error("Menu API error:", err);
    return res.status(500).json({ error: "Failed to load menu" });
  }
}
