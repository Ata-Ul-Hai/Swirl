import fs from "fs";
import path from "path";

function getFallbackRestaurants() {
  try {
    const seedPath = path.resolve(process.cwd(), "server/data/restaurants.json");
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, "utf8");
      const seedList = JSON.parse(raw);
      return seedList.map((r) => ({
        info: {
          id: String(r.id || r._id),
          name: r.name,
          cuisines: r.cuisines || [],
          rating: r.rating || 4.0,
          avgRating: r.rating || 4.0,
          avgRatingString: r.avgRatingString || String(r.rating || "4.0"),
          totalRatingsString: r.totalRatingsString || "1K+",
          costForTwo: r.costForTwo || "₹350 for two",
          cloudinaryImageId: r.cloudinaryImageId || "",
          imageUrl: r.imageUrl || "",
          locality: r.locality || "",
          areaName: r.areaName || "",
          isOpen: r.isOpen ?? true,
          sla: r.sla || { deliveryTime: 30, slaString: "25-30 mins" },
        },
      }));
    }
  } catch (err) {
    console.error("Error reading server seed data:", err);
  }

  try {
    const mockPath = path.resolve(process.cwd(), "client/src/components/Mock/ResList.json");
    if (fs.existsSync(mockPath)) {
      const raw = fs.readFileSync(mockPath, "utf8");
      const mock = JSON.parse(raw);
      return mock?.data?.cards?.[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];
    }
  } catch (err) {
    console.error("Error reading client mock data:", err);
  }

  return [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let restaurants = getFallbackRestaurants();

    const { search, rating } = req.query;

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      restaurants = restaurants.filter((r) => {
        const info = r.info || r;
        const nameMatch = info.name && info.name.toLowerCase().includes(q);
        const cuisineMatch = Array.isArray(info.cuisines)
          ? info.cuisines.some((c) => c.toLowerCase().includes(q))
          : String(info.cuisines || "").toLowerCase().includes(q);
        return nameMatch || cuisineMatch;
      });
    }

    if (rating) {
      const minRating = Number(rating);
      restaurants = restaurants.filter((r) => {
        const info = r.info || r;
        const rate = Number(info.rating || info.avgRating || 0);
        return rate >= minRating;
      });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json({
      success: true,
      total: restaurants.length,
      data: restaurants,
      cards: [
        {},
        {
          card: {
            card: {
              gridElements: {
                infoWithStyle: {
                  restaurants: restaurants,
                },
              },
            },
          },
        },
      ],
    });
  } catch (error) {
    console.error("Restaurant API error:", error);
    const fallback = getFallbackRestaurants();
    return res.status(200).json({
      success: true,
      data: fallback,
    });
  }
}
