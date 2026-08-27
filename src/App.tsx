import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// Pages
import CardBuilderPage from './pages/CardBuilderPage'
import ComponentLibrary from './pages/ComponentLibrary'
import DeckManagerPage from './pages/DeckManagerPage'
import PracticePage from './pages/PracticePage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DeckManagerPage />} />
        <Route path="/decks/:deckId" element={<CardBuilderPage />} />
        <Route path="/decks/:deckId/practice" element={<PracticePage />} />
        <Route path="/components" element={<ComponentLibrary />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
