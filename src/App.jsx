import { Routes, Route, Navigate } from 'react-router-dom'
import { FoodOpsLayout } from './pages'

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<FoodOpsLayout />} />
    </Routes>
  )
}
