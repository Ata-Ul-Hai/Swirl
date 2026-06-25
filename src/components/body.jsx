import { useState, useEffect, useContext } from 'react'
import RestaurantCard, { withPromotedLabel } from "./RestaurantCard"  
// import './body.css'
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

                console.log(json);
                
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

        <div className="body "> 
            <div className='flex'>
                <div className="search mx-4 p-4">
                    <input type="text" 
                    data-testid = 'search'
                    className='border border-solid border-black px-2' value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value)}}/>

                    <button 
                    className='px-4 py-2 m-4 rounded-lg hover:cursor-pointer bg-green-200 hover:bg-green-400 focus:outline-2 focus:outline-offset-2 active:outline-green-700' 
                    
                    onClick={() => {
                        const filtered = products.filter((res) => res.info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        // console.log(filtered);
                        
                        setFilterProduct(filtered);
                    }}>
                        Search
                    </button>
                </div>

                <div className="search m-4 p-4 flex items-center ">
                    <button
                    className="px-4 py-2 rounded-lg hover:cursor-pointer text-white bg-violet-600 hover:bg-violet-800 focus:outline-2 focus:outline-offset-2  active:outline-violet-700"
                    onClick={() => {
                        const filteredList = filterProduct.filter(
                        (res) => res.info.avgRating > 4
                        );
                        setFilterProduct(filteredList);
                    }}
                    >
                        Top Rated Restaurants
                    </button>
                </div>  

                <div className="search m-4 p-4 flex items-center ">
                    <label htmlFor="user">For User</label>
                    <input id='user'
                    value={loggedInUser} 
                    className='border border-black px-2 m-2' 
                    onChange={(e) => setUserName(e.target.value)} />
                </div> 
            </div>

            <div  className="flex flex-wrap justify-between">
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