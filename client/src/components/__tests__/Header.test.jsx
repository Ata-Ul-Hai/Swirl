import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Header from "../Header";
import { Provider } from "react-redux";
import appStore from '../../utils/appStore'
import { BrowserRouter } from "react-router";

it('Should render Header component with a login button', () => {
    render(
        <BrowserRouter>
            <Provider store={appStore}>
                < Header/>
            </Provider>
        </BrowserRouter>
    );

    const logButton = screen.getByRole('button', {name: 'LogIn'})
    // const logButton = screen.getByText('LogIn')

    expect(logButton).toBeInTheDocument()
})

it('Should render Header component with a cart items 0', () => {
    render(
        <BrowserRouter>
            <Provider store={appStore}>
                < Header/>
            </Provider>
        </BrowserRouter>
    );

    const cartItems = screen.getByText('🛒(0)')
    // Regex Method
    // const cartItems = screen.getByText(/(0)/) 

    expect(cartItems).toBeInTheDocument()
})

it('Should check LogIn to LogOut button onClick', () => {
    render(
        <BrowserRouter>
            <Provider store={appStore}>
                < Header/>
            </Provider>
        </BrowserRouter>
    );

    const logInButton = screen.getByRole('button', {name: 'LogIn'})

    fireEvent.click(logInButton)
    const logOutButton = screen.getByRole('button', {name: 'LogOut'})

    expect(logOutButton).toBeInTheDocument()
})