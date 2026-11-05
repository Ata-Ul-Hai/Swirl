import ItemList from "./ItemList.jsx"

function RestaurantCategory({ data, showItems, setShowIndex, resetIndex }) {
    const handleClick = () => {
        if (showItems) {
            resetIndex()
        } else {
            setShowIndex()
        }
    }

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            {/* Accordion header */}
            <button
                type="button"
                className="w-full flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors text-left"
                onClick={handleClick}
            >
                <span className="font-bold text-lg text-gray-900">
                    {data.title} ({data.itemCards.length})
                </span>
                <span
                    className={`text-gray-500 text-xl transition-transform duration-200 ${showItems ? "rotate-180" : ""}`}
                >
                    ⌄
                </span>
            </button>

            {/* Accordion body */}
            {showItems && (
                <div className="px-2 pb-2">
                    <ItemList data={data.itemCards} />
                </div>
            )}
        </div>
    )
}

export default RestaurantCategory
