import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { search = "", rating, page = 1, limit = 20 } = req.query || {};

    // Read seed data from server/data/restaurants.json
    const seedPath = path.resolve(process.cwd(), "server/data/restaurants.json");
    let restaurants = [];

    if (fs.existsSync(seedPath)) {
      restaurants = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    } else {
      // Fallback to local mock data if server seed file is not present
      const fallbackPath = path.resolve(
        process.cwd(),
        "client/src/components/Mock/ResList.json"
      );
      if (fs.existsSync(fallbackPath)) {
        const mock = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
        return res.status(200).json(mock);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      restaurants = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.cuisines && r.cuisines.some((c) => c.toLowerCase().includes(q))) ||
          (r.locality && r.locality.toLowerCase().includes(q)) ||
          (r.areaName && r.areaName.toLowerCase().includes(q))
      );
    }

    if (rating !== undefined && rating !== "") {
      const minRating = Number(rating);
      restaurants = restaurants.filter(
        (r) =>
          (r.rating !== null && r.rating >= minRating) ||
          parseFloat(r.avgRatingString || 0) >= minRating
      );
    }

    const total = restaurants.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginated = restaurants.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum
    );

    const formatted = paginated.map((r) => ({
      info: {
        id: String(r.id),
        name: r.name,
        cuisines: r.cuisines || [],
        rating: r.rating,
        avgRating: r.rating,
        avgRatingString: r.avgRatingString || String(r.rating || "N/A"),
        totalRatingsString: r.totalRatingsString || "",
        costForTwo: r.costForTwo || "",
        cloudinaryImageId: r.cloudinaryImageId || "",
        imageUrl: r.imageUrl || "",
        locality: r.locality || "",
        areaName: r.areaName || "",
        isOpen: r.isOpen ?? true,
        sla: r.sla || {},
      },
    }));

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      data: formatted,
    });
  } catch (error) {
    console.error("Restaurant API error:", error);
    return res.status(500).json({ error: error.message });
  }
}
