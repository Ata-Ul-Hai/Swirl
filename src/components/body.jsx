import { useState, useEffect } from 'react'
import RestaurantCard from "./Card"  
// import './body.css'
import axios from 'axios'
import Shimmer from './Shimmer'

function Body(){
    const [products, setProducts] = useState([])
    const [filterProduct, setFilterProduct] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {

                const json = await axios.get("https://corsproxy.io/?https://www.swiggy.com/dapi/restaurants/list/v5?lat=12.9351929&lng=77.62448069999999&page_type=DESKTOP_WEB_LISTING")


                console.log(json?.data?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                
                // console.log(json?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);

                setProducts(json?.data?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                setFilterProduct(json?.data?.data?.cards[4]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])
    
    return products.length ===0? <Shimmer />: (
        <div className="body"> 
            <div className="search">
                <input type="text" className='search-button' value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value)}}/>

                <button onClick={() => {
                    const filtered = products.filter((res) => res.info.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    // console.log(filtered);
                    
                    setFilterProduct(filtered);
                }}>Search</button>
            
            </div>
            
            <div className="res-container">
                {filterProduct.map((product) => (
                    <RestaurantCard key={product.info.id} resData = {product.info} />
                ))}
            </div>

        </div>
        
    )
}

export default Body 