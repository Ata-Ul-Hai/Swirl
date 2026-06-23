import { CDN_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addItem } from "../utils/cartSlice";

const ItemList = (itemCards) => {
    const itemList = itemCards.data

    const dispatch = useDispatch();

    const handleAddBtn = (item) => {
        // Dispatch an action
        dispatch(addItem(item));
    };

    console.log(itemCards);
    
    return <div>
        {itemList.map((item) => (
            <div key={item.card.info.id} className="p-4 m-2 border-gray-200 border-b-2 text-left flex justify-between"> 
                <div>
                    <div className="py-2 font-bold text-sm flex flex-col">
                        <span>{item.card.info.name}</span>
                        <span>₹{(item.card.info.defaultPrice)/100}</span>
                    </div>
                    <p className="text-xs w-11/12">{item.card.info.description}</p>
                </div>
                <div className="">
                    <div className="absolute">
                        <button className="text-green-600 font-bold py-1 px-5 text-lg bg-white border border-solid border-green-600 rounded-xl"
                        onClick={() => handleAddBtn(item)} >
                            ADD
                        </button>
                    </div>
                </div>
                    <img src={CDN_URL + item.card.info.imageId} alt="img" className="w-36 rounded-xl" />

                
            </div>
        ))
        
        }
        
    </div>
}
export default ItemList