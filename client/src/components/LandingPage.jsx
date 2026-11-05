import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { RESTAURANTS_API, CDN_URL } from "../utils/constants";
import ResList from "./Mock/ResList.json";

const POPULAR_CUISINES = [
  { name: "Pizza", icon: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80" },
  { name: "Biryani", icon: "🍛", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80" },
  { name: "Burgers", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80" },
  { name: "Chinese", icon: "🍜", image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&auto=format&fit=crop&q=80" },
  { name: "Desserts", icon: "🍰", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80" },
  { name: "Healthy", icon: "🥗", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80" },
  { name: "Rolls", icon: "🌯", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80" },
  { name: "Coffee", icon: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Superfast Delivery",
    desc: "Average 28-min doorstep delivery with hot, fresh food straight from local kitchens.",
  },
  {
    icon: "📍",
    title: "Real-Time Tracking",
    desc: "Live Socket.io status updates from the moment the kitchen accepts your order to arrival.",
  },
  {
    icon: "🍲",
    title: "Curated Restaurants",
    desc: "Handpicked, verified hygiene ratings, authentic local favorites, and top national chains.",
  },
  {
    icon: "💰",
    title: "Transparent Pricing",
    desc: "Distance-based delivery calculation, live item price freeze, and zero hidden checkout fees.",
  },
];

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(RESTAURANTS_API);
        const list =
          res?.data?.data?.cards?.[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants ||
          (Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : []);

        if (isMounted) {
          if (list && list.length > 0) {
            setFeaturedRestaurants(list.slice(0, 6));
          } else {
            const fallback = ResList?.data?.cards?.[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];
            setFeaturedRestaurants(fallback.slice(0, 6));
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = ResList?.data?.cards?.[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants || [];
          setFeaturedRestaurants(fallback.slice(0, 6));
          setLoading(false);
        }
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/restaurants");
    }
  };

  const handleCuisineClick = (cuisine) => {
    navigate(`/restaurants?search=${encodeURIComponent(cuisine)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100/60 pt-10 pb-20 md:py-24 border-b border-orange-100">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-semibold tracking-wide uppercase shadow-xs">
                <span>🔥</span>
                <span>Fastest Food Delivery in Town</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Crave it? <span className="text-orange-500 underline decoration-orange-300 decoration-wavy">Get it</span> delivered in minutes.
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Explore thousands of curated restaurants, sizzling local street food, and chef specials delivered fresh and hot right to your doorstep.
              </p>

              {/* Search Bar Form */}
              <form onSubmit={handleSearchSubmit} className="mt-4 max-w-xl mx-auto lg:mx-0">
                <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white rounded-2xl shadow-lg border border-orange-100 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                  <div className="flex items-center gap-3 px-3 w-full">
                    <span className="text-xl text-gray-400">🔍</span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for restaurants, dishes, or cuisines..."
                      className="w-full py-2.5 bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-orange-500/25 cursor-pointer whitespace-nowrap"
                  >
                    Find Food
                  </button>
                </div>
              </form>

              {/* Quick Filter Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Trending:</span>
                {["Biryani", "Pizza", "Burgers", "Chinese", "Desserts"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleCuisineClick(tag)}
                    className="text-xs bg-white/80 hover:bg-orange-500 hover:text-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-500 transition-all cursor-pointer font-medium shadow-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/restaurants"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-base font-bold rounded-xl shadow-md hover:shadow-xl transition-all"
                >
                  <span>Explore All Restaurants</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/restaurant"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-orange-50 text-orange-600 text-base font-bold rounded-xl border border-orange-200 transition-all shadow-xs"
                >
                  <span>Partner Portal</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-orange-200/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">500+</div>
                  <div className="text-xs text-gray-500">Verified Kitchens</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">28 mins</div>
                  <div className="text-xs text-gray-500">Average Delivery</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">4.8 ★</div>
                  <div className="text-xs text-gray-500">App Store Rating</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Card */}
                <div className="bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 transform hover:scale-[1.02] transition-transform">
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3">
                    <img
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
                      alt="Gourmet food"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>28 MINS</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-xl text-white">
                      <div className="font-bold text-lg">Royal Feast Special</div>
                      <div className="text-xs text-orange-200">North Indian, Mughlai, Biryani</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between px-2">
                    <div>
                      <div className="text-xs text-gray-400">Limited Deal</div>
                      <div className="text-sm font-bold text-green-600">Flat 50% OFF up to ₹100</div>
                    </div>
                    <Link
                      to="/restaurants"
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>

                {/* Floating Badge 1: Live Status */}
                <div className="absolute -top-4 -left-6 bg-white/95 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
                    🛵
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Rider on the way</div>
                    <div className="text-[11px] text-gray-500">Live GPS tracking active</div>
                  </div>
                </div>

                {/* Floating Badge 2: Real Ratings */}
                <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md border border-gray-100 p-3.5 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
                    ⭐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">4.9 / 5 Rating</div>
                    <div className="text-[11px] text-gray-500">From 10,000+ Foodies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CUISINES / CATEGORIES */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Inspiration</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">What are you craving today?</h2>
            </div>
            <Link
              to="/restaurants"
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>See all foods</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {POPULAR_CUISINES.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleCuisineClick(item.name)}
                className="group flex flex-col items-center p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all text-center cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{item.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED RESTAURANTS PREVIEW */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Curated For You</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Top Rated Restaurants Near You
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Popular spots loved by your neighborhood foodies.
              </p>
            </div>
            <Link
              to="/restaurants"
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <span>View All Restaurants</span>
              <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
                  <div className="h-44 bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((res) => {
                const info = res.info || res;
                const id = info.id || info._id;
                const imageSrc = info.cloudinaryImageId
                  ? CDN_URL + info.cloudinaryImageId
                  : info.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80";

                return (
                  <Link
                    key={id}
                    to={`/restaurants/${id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all flex flex-col"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                      <img
                        src={imageSrc}
                        alt={info.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                        <span>⭐</span>
                        <span>{info.avgRatingString || info.rating || "4.2"}</span>
                      </div>
                      {info.sla?.deliveryTime && (
                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-white">
                          🕒 {info.sla.deliveryTime} mins
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {info.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {Array.isArray(info.cuisines) ? info.cuisines.join(", ") : info.cuisines}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <span>{info.costForTwo || "₹300 for two"}</span>
                        <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                          Order Now →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-orange-500/25 transition-all text-base"
            >
              <span>Explore All Restaurants in Your Area</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SWIRL */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Built for Food Lovers</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Why Order on Swirl?</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2">
              Designed from the ground up for seamless ordering, transparent pricing, and instant real-time kitchen tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-slate-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-2xl flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Simple & Fast</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500 text-white font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Pick a Restaurant</h3>
              <p className="text-sm text-gray-500">
                Browse our curated directory of local gems, top brands, and filter by rating, cuisine, or price.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500 text-white font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Customize Your Cart</h3>
              <p className="text-sm text-gray-500">
                Choose item sizes, variants, and frozen-price protection. Add your address for accurate delivery fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500 text-white font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Live Order Tracking</h3>
              <p className="text-sm text-gray-500">
                Follow your meal from kitchen prep to your doorstep in real-time with our live status stepper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER CTA BANNER */}
      <section className="py-14 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-md bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wide">
                Restaurant Owners
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Partner with Swirl to grow your business</h2>
              <p className="text-gray-300 text-sm max-w-xl">
                Get access to live incoming order dispatch, customizable prep timers, and real-time menu management on our dedicated Restaurant Panel.
              </p>
            </div>
            <Link
              to="/restaurant"
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              Open Partner Panel →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-12 mt-auto border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span>🍔</span>
                <span>Swirl</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Modern MERN food delivery platform. Delivering hot flavors and delightful meals every single day.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/restaurants" className="hover:text-orange-400 transition-colors">All Restaurants</Link></li>
                <li><Link to="/grocery" className="hover:text-orange-400 transition-colors">Swirl Instamart</Link></li>
                <li><Link to="/cart" className="hover:text-orange-400 transition-colors">My Cart</Link></li>
                <li><Link to="/restaurant" className="hover:text-orange-400 transition-colors">Partner Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-orange-400 transition-colors">Contact Support</Link></li>
                <li><span className="hover:text-orange-400 cursor-pointer">Careers</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer">Privacy & Terms</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Cities Served</h4>
              <ul className="space-y-2 text-xs">
                <li>Delhi NCR</li>
                <li>Bangalore</li>
                <li>Mumbai</li>
                <li>Hyderabad</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Swirl Technologies Pvt Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
