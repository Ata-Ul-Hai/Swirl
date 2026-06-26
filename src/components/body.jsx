import { useState, useEffect, useContext } from 'react'
import RestaurantCard, { withPromotedLabel } from "./RestaurantCard"  
import axios from 'axios'
import Shimmer from './Shimmer'
import { Link } from 'react-router'
import UserContext from '../utils/UserContext'

function Body(){
    const [products, setProducts] = useState([])
    const [filterProduct, setFilterProduct] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const RestauranntCardPromoted = withPromotedLabel(RestaurantCard);
    const {loggedInUser, setUserName} = useContext(UserContext)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const json = await axios.get("https://proxy.corsfix.com/?https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.5488579&lng=77.2900505&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING")

                setProducts(json?.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                setFilterProduct(json?.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])
    
    return products?.length === 0 ? <Shimmer />: (

        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            data-testid="search"
                            placeholder="Search for restaurants..."
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 font-medium transition-colors cursor-pointer"
                            onClick={() => {
                                const filtered = products.filter((res) =>
                                    res.info.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                setFilterProduct(filtered);
                            }}
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <button
                            className="border border-gray-300 bg-white hover:bg-gray-50 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-colors cursor-pointer"
                            onClick={() => {
                                const filteredList = products.filter(
                                    (res) => res.info.avgRating > 4
                                );
                                setFilterProduct(filteredList);
                            }}
                        >
                            Top Rated Restaurants
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <label htmlFor="user">For User</label>
                            <input
                                id="user"
                                value={loggedInUser}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 bg-white focus:ring-2 focus:ring-orange-400 outline-none"
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {filterProduct?.map((product) => (
                        <Link key={product.info.id} to={'/restaurants/'+product.info.id} className="block w-full">
                            { product.info.isOpen ? (
                                <RestauranntCardPromoted resData={product.info}/>
                            ):(
                                <RestaurantCard resData={product.info} />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Body
