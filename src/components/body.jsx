import { useState, useEffect } from 'react'
import RestaurantCard from "./Card"  
// import './body.css'
import axios from 'axios'
import Shimmer from './Shimmer'
import { Link } from 'react-router'

function Body(){
    const [products, setProducts] = useState([])
    const [filterProduct, setFilterProduct] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchProducts = async () => {
            try {

                const json = await axios.get("https://proxy.corsfix.com/?https://www.swiggy.com/dapi/restaurants/list/v5?lat=27.8789386&lng=79.929197&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING")

                console.log(json.data.data);
                
                console.log(json?.data?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                
                // console.log(json?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle?.restaurants);

                setProducts(json?.data?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
                setFilterProduct(json?.data?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle?.restaurants);
            } catch (error) {
                console.error("Error fetching products:", error)
            }
        }
        fetchProducts()
    }, [])
    
    return products?.length === 0 ? <Shimmer />: (

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
                {filterProduct?.map((product) => (
                    <Link key={product.info.id} to={'/restaurants/'+product.info.id}> <RestaurantCard resData = {product.info} /> </Link>
                ))}
            </div>

        </div>
        
    )
}

export default Body 