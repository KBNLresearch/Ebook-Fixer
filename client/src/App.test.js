import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Editor from './components/editor/Editor'
import App from './App'

test('renders button text', () => {
    renderWithRouter(<Editor />)
    const titleElement = screen.getByText(/Editor/i)
    expect(titleElement).toBeInTheDocument()
})

const renderWithRouter = (element) =>
    render(<MemoryRouter>{element}</MemoryRouter>)

// test('renders Front Page title', () => {
//     renderWithRouter(<App />)
//     const titleElement = screen.getByText(/Fix/i)
//     expect(titleElement).toBeInTheDocument()
// })
