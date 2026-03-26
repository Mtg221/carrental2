import { useState, useEffect } from 'react'
import { apiFetch } from '../api'
import { useAuth } from '../context/AuthContext'
import CarCard from '../components/CarCard'
import BookingModal from '../components/BookingModal'
import '../styles/fleet.css'

const CATEGORIES = ['all', 'luxury', 'sports', 'suv', 'electric', 'economy']

export default function FleetPage({ showToast, openModal }) {
  const { currentUser } = useAuth()
  const [cars, setCars]           = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [fuel, setFuel]           = useState('all')
  const [trans, setTrans]         = useState('all')
  const [maxPrice, setMaxPrice]   = useState('')
  const [category, setCategory]   = useState('all')
  const [bookingCar, setBookingCar] = useState(null)

  useEffect(() => {
    apiFetch('/cars')
      .then(data => { setCars(data); setFiltered(data) })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...cars]
    if (category !== 'all') result = result.filter(c => c.category === category)
    if (search)   result = result.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(search.toLowerCase()))
    if (fuel !== 'all') result = result.filter(c => c.fuel === fuel)
    if (trans !== 'all') result = result.filter(c => c.transmission === trans)
    if (maxPrice) result = result.filter(c => c.pricePerDay <= Number(maxPrice))
    setFiltered(result)
  }, [cars, search, fuel, trans, maxPrice, category])

  const handleBook = (carId) => {
    if (!currentUser) { openModal('login'); return }
    const car = cars.find(c => c.id === carId)
    if (car) setBookingCar(car)
  }

  return (
    <div className="page active">
      <div className="search-section">
        <div className="section-header">
          <p className="section-label">Our Collection</p>
          <h2 className="section-title">The Fleet</h2>
        </div>
        <div className="search-bar">
          <div className="search-group" style={{ flex: 2 }}>
            <label>Search</label>
            <input type="text" placeholder="Make or model..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="search-group">
            <label>Fuel Type</label>
            <select value={fuel} onChange={e => setFuel(e.target.value)}>
              <option value="all">All</option>
              <option value="petrol">Petrol</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="search-group">
            <label>Transmission</label>
            <select value={trans} onChange={e => setTrans(e.target.value)}>
              <option value="all">All</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="search-group">
            <label>Max Price/Day</label>
            <input type="number" placeholder="Any price"
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem 1rem' }}>
        <div className="filters-row">
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="cars-section">
        {loading ? (
          <div className="loading"><div className="spinner" />Loading fleet...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>No vehicles found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="cars-grid">
            {filtered.map(car => (
              <CarCard key={car.id} car={car} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      {bookingCar && (
        <BookingModal
          car={bookingCar}
          onClose={() => setBookingCar(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}