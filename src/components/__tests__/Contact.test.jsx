import { render, screen } from "@testing-library/react"
import Contact from "../Contact"
import { describe, expect, it, test } from "vitest"
// import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"

describe("Tests for Contact Page", () => {
    // beforeAll(() => {
    //     console.log('before all');
    // })
    // beforeEach(() => {
    //     console.log('before each');
    // })

    // afterAll(()=>{
    //     console.log('after all');
    // })
    // afterEach(() => {
    //     console.log('after each');
    // })

    test('Should check if heading is being rendered',() => {
        render(<Contact />)

        const heading = screen.getByRole('heading')

        expect(heading).toBeInTheDocument()
    })

    test('sould check submit button', () => {
        render(<Contact />)

        const button = screen.getByRole('button')

        // Assertion
        expect(button).toBeInTheDocument()
    })

    test("Should check if there is an element with the text Submit", () => {
        render(<Contact />)

        const submit = screen.getByText('Submit')

        expect(submit).toBeInTheDocument()
    })

    it('Should check input by it\'s placeholder', ()=>{
        render(<Contact />)

        const placeholder = screen.getByPlaceholderText('name')

        expect(placeholder).toBeInTheDocument()
    })

    it('Should check there are 2 input boxes', ()=>{
        render(<Contact />)

        // Query
        const len = screen.getAllByRole('textbox')

        expect(len.length).toBe(2)
    })

})



