import { useState } from "react"
import ItemList from "./ItemList.jsx"

function RestaurantCategory({data, showItems, setShowIndex, resetIndex}){
    const [open, setOpen] = useState(false)
    const handleClick = () => {
        if (!open){
            setOpen(!open)
            setShowIndex()
        }
        else {
            setOpen(!open)
            resetIndex()
        }
    }
    return (
        <div className="w-6/12 bg-gray-50 shadow-2xl  p-4 mx-auto my-4 ">
            {/* Accordion header */}
            <div className="flex justify-between cursor-pointer" onClick={handleClick}>
                <span className="font-bold text-lg">{data.title} ({data.itemCards.length})</span>
                <span className="text-2xl font-bold">⌄</span>
            </div>
            {/* Accordion body */}
            <div className="">
                {showItems?<ItemList data={data.itemCards} />:<></>}
            </div>
        </div>

    )
}

export default RestaurantCategory