import { configureStore } from "@reduxjs/toolkit";
import cartReducer from './cartSlice'

const appStore = configureStore({
    reducer:{
        // ReduxTK uses immer behind the scenes
        cart: cartReducer
    }
})

export default appStore