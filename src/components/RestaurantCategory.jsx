import { useState } from "react"
import ItemList from "./ItemList.jsx"

function RestaurantCategory(data){
    const menu = data.data
    const [showItems, setShowItems] = useState(false)
    const handleClick = () => {
        setShowItems(!showItems)
    }
    return (
        <div className="w-6/12 bg-gray-50 shadow-2xl  p-4 mx-auto my-4 ">
            {/* Accordion header */}
            <div className="flex justify-between cursor-pointer" onClick={handleClick}>
                <span className="font-bold text-lg">{menu.title} ({menu.itemCards.length})</span>
                <span className="text-2xl font-bold">⌄</span>
            </div>
            {/* Accordion body */}
            <div className="">
                {showItems?<ItemList data={menu.itemCards} />:<></>}
            </div>
        </div>

    )
}

export default RestaurantCategory