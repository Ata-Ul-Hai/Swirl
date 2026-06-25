import { expect, it, vi } from "vitest";
import Body from '../Body'
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import axios from "axios";
import MOCK_DATA from '../Mock/ResList.json'

vi.mock('axios');

axios.get.mockImplementation(async () => {
  return { data: MOCK_DATA };
});

// axios.get = vi.fn(() =>
//   Promise.resolve({
//     data: MOCK_DATA,
//   })
// );

it('should render the body component along with the search button', async () =>{
    render(
        <BrowserRouter>
            <Body/>
        </BrowserRouter>
        
    )

    const searchButton = await screen.findByRole('button', {name: 'Search'})

    expect(searchButton).toBeInTheDocument()
})

it('should search Res List for pizza text input', async () =>{
    render(
        <BrowserRouter>
            <Body/>
        </BrowserRouter>
    )
    const searchButton = await screen.findByRole('button', {name: 'Search'})
    const searchInput = screen.getByTestId('search')
    
    const cardBeforeSearch = screen.getAllByTestId('resCard')
    expect(cardBeforeSearch.length).toBe(20)

    // console.log(searchInput);

    fireEvent.change(searchInput, {target: {value: "pizza"}})
    fireEvent.click(searchButton)

    const resCards = screen.getAllByTestId('resCard')
    // console.log(resCards);
    expect(resCards.length).toBe(3)
})

it('should check number of card in top rated restaurants', async ()=>{
    render(
        <BrowserRouter>
            <Body />
        </BrowserRouter>
    )

    const topResBtn = await screen.findByRole('button', {name: "Top Rated Restaurants"})

    fireEvent.click(topResBtn);

    const resCard = screen.getAllByTestId('resCard')

    expect(resCard.length).toBe(19)
})

