import { render, screen } from "@testing-library/react";
import { expect, it, test } from "vitest";
import RestaurantCard from '../RestaurantCard'
import MOCK_DATA from '../Mock/RestaurantCard.json'
import {withPromotedLabel} from '../RestaurantCard'

test('should render RestaurantCard component with props data', () => {
    render(<RestaurantCard resData={MOCK_DATA}/>)

    const cardName = screen.getByText('Pizza Hut')

    expect(cardName).toBeInTheDocument()
})

it('Should render component with Open label', ()=>{
    const Promoted = withPromotedLabel(RestaurantCard)
    render(<Promoted resData={MOCK_DATA}/>)

    const label = screen.getByText('Open')

    expect(label).toBeInTheDocument()
})