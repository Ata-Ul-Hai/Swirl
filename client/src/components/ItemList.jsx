import { CDN_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addItem } from "../utils/cartSlice";

const ItemList = ({ data: itemList }) => {
    const dispatch = useDispatch();

    const handleAddBtn = (item) => {
        // Dispatch an action
        dispatch(addItem(item));
    };

    const getPrice = (info) => {
        const price = info.price ?? info.defaultPrice;
        return price ? `₹${price / 100}` : "";
    };

    return (
        <div>
            {itemList.map((item) => {
                const info = item.card.info;
                const hasImage = Boolean(info.imageId);

                return (
                    <div
                        data-testid="foodItems"
                        key={info.id}
                        className="flex justify-between gap-4 p-4 border-b border-gray-100 last:border-b-0"
                    >
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block w-4 h-4 border-2 rounded-sm shrink-0 ${
                                        info.isVeg
                                            ? "border-green-600"
                                            : "border-red-600"
                                    }`}
                                >
                                    <span
                                        className={`block w-2 h-2 rounded-full m-auto mt-0.5 ${
                                            info.isVeg ? "bg-green-600" : "bg-red-600"
                                        }`}
                                    />
                                </span>
                                <h4 className="font-semibold text-gray-900">{info.name}</h4>
                            </div>

                            <p className="font-medium text-gray-800 mt-2">{getPrice(info)}</p>

                            {info.description && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                                    {info.description}
                                </p>
                            )}
                        </div>

                        {hasImage && (
                            <div className="relative shrink-0 w-28 sm:w-36">
                                <img
                                    src={CDN_URL + info.imageId}
                                    alt={info.name}
                                    className="w-full h-24 sm:h-28 object-cover rounded-xl"
                                />
                                <button
                                    type="button"
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-green-600 font-bold text-sm bg-white border-2 border-green-600 rounded-lg px-6 py-1 shadow-sm hover:bg-green-50 transition-colors cursor-pointer"
                                    onClick={() => handleAddBtn(item)}
                                >
                                    ADD
                                </button>
                            </div>
                        )}

                        {!hasImage && (
                            <button
                                type="button"
                                className="self-start shrink-0 text-green-600 font-bold text-sm bg-white border-2 border-green-600 rounded-lg px-6 py-1 hover:bg-green-50 transition-colors cursor-pointer"
                                onClick={() => handleAddBtn(item)}
                            >
                                ADD
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ItemList;
