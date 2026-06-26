const SWIGGY_RESTAURANTS_URL =
  "https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.5488579&lng=77.2900505&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING";

const SWIGGY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  Origin: "https://www.swiggy.com",
  Referer: "https://www.swiggy.com/",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(SWIGGY_RESTAURANTS_URL, {
      headers: SWIGGY_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Swiggy API returned ${response.status}`);
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Restaurant API error:", error);

    // Fallback mock data so the deployed app still works if Swiggy blocks the request
    const { default: mockData } = await import(
      "../src/components/Mock/ResList.json"
    );
    return res.status(200).json(mockData);
  }
}
