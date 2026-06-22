import { useState, useEffect } from 'react'
import RestaurantCard, { withPromotedLabel } from "./RestaurantCard"  
// import './body.css'
import axios from 'axios'
import Shimmer from './Shimmer'
import { Link } from 'react-router'

function Body(){
    const [products, setProducts] = useState([])
    const [filterProduct, setFilterProduct] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    const RestauranntCardPromoted = withPromotedLabel(RestaurantCard);

    useEffect(() => {
        const fetchProducts = async () => {
            try {

                const json = await axios.get("https://proxy.corsfix.com/?https://www.swiggy.com/dapi/restaurants/list/v5?lat=28.5488579&lng=77.2900505&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING")

                // console.log(json.data.data);
                
                // console.log(json?.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                
                // console.log(json?.data?.cards[]?.card?.card?.gridElements?.infoWithStyle?.restaurants);

                setProducts(json?.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                setFilterProduct(json?.data?.data?.cards[1]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])
    
    return products?.length === 0 ? <Shimmer />: (

        <div className="body"> 
            <div className='flex'>
                <div className="search mx-4 p-4">
                    <input type="text" className='border border-solid border-black' value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value)}}/>

                    <button className='px-4 py-2 bg-green-100 m-4  rounded-lg' onClick={() => {
                        const filtered = products.filter((res) => res.info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        // console.log(filtered);
                        
                        setFilterProduct(filtered);
                    }}>Search</button>
                </div>
                <div className="search m-4 p-4 flex items-center">
                    <button
                    className="px-4 py-2 bg-gray-100 rounded-lg"
                    onClick={() => {
                        const filteredList = products.filter(
                        (res) => res.info.avgRating > 4
                        );
                        setFilterProduct(filteredList);
                    }}
                    >
                    Top Rated Restaurants
                    </button>
                </div>  
            </div>

            
            
            <div className="flex flex-wrap">
                {filterProduct?.map((product) => (
                    <Link key={product.info.id} to={'/restaurants/'+product.info.id}> 
                    {/* currently switched to isOpen because promoted label not there anymore */}
                        { product.info.isOpen ? (
                                <RestauranntCardPromoted resData = {product.info}/>
                            ):(
                                <RestaurantCard resData = {product.info} /> 
                            )
                        }
                    </Link>
                ))}
            </div>

        </div>
        
    )
}

export default Body 