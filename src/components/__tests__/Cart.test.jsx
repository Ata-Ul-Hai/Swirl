import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Header from '../Header'
import RestaurantMenu from '../RestaurantMenu'
import Cart from '../Cart'
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import appStore from '../../utils/appStore'


it('should load restaurant menu component', async () =>{
    render(
        <Provider store={appStore}>
            <BrowserRouter>
                <Header />
                <Cart />
                <RestaurantMenu />
            </BrowserRouter>
        </Provider>
    );

    const accordionHeader = await screen.findByText('Recommended (18)');
    fireEvent.click(accordionHeader);

    expect(screen.getAllByTestId('foodItems').length).toBe(18);

    const addBtns = screen.getAllByRole('button', {name: 'ADD'});
    fireEvent.click(addBtns[0]);
    
    expect(screen.getByText('🛒(1)')).toBeInTheDocument();

    fireEvent.click(addBtns[1]);

    expect(screen.getByText('🛒(2)')).toBeInTheDocument();

    expect(screen.getAllByTestId('foodItems').length).toBe(20);

    fireEvent.click(screen.getByRole('button', {name: 'Clear Cart'}))

    expect(screen.getAllByTestId('foodItems').length).toBe(18);

    expect(screen.getByText('Cart is empty'))

})