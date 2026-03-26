import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'
import AddCarModal from '../components/AddCarModal'
import '../styles/admin.css'

const fmtDate  = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const fuelIcon = f => f === 'electric' ? '⚡' : f === 'hybrid' ? '🌿' : '⛽'

const STAT_DEFS = [
  { key: 'totalCars',     label: 'Total Cars',     icon: '🚗' },
  { key: 'totalUsers',    label: 'Total Users',    icon: '👤' },
  { key: 'totalBookings', label: 'Total Bookings', icon: '📋' },
  { key: 'totalRevenue',  label: 'Revenue',        icon: '💰', fmt: v => '$' + v.toLocaleString() },
]

export default function AdminPage({ navigate, showToast }) {
  const { currentUser } = useAuth()
  const [stats, setStats]       = useState(null)
  const [bookings, setBookings] = useState([])
  const [cars, setCars]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAddCar, setShowAddCar] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') { navigate('home'); return }
    load()
  }, [currentUser])

  const load = async () => {
    setLoading(true)
    try {
      const [s, b, c] = await Promise.all([
        apiFetch('/bookings/admin/stats'),
        apiFetch('/bookings'),
        apiFetch('/cars'),
      ])
      setStats(s); setBookings(b); setCars(c)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteCar = async (id) => {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return
    try {
      await apiFetch('/cars/' + id, { method: 'DELETE' })
      showToast('Vehicle removed', 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  if (loading) return <div className="page active"><div className="loading"><div className="spinner" />Loading dashboard...</div></div>

  return (
    <div className="page active">
      <div className="page-inner" style={{ maxWidth: '1100px' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage vehicles, bookings, and users.</p>

        {/* Stats */}
        <div className="stats-grid">
          {STAT_DEFS.map(s => (
            <div key={s.key} className="stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div className="stat-value">
                {s.fmt ? s.fmt(stats?.[s.key] ?? 0) : stats?.[s.key] ?? 0}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings table */}
        <h3 className="admin-section-title">All Bookings</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th><th>Car</th><th>Dates</th>
                <th>Days</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No bookings yet</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {b.id.slice(0, 8)}...
                  </td>
                  <td>{b.car.make} {b.car.model}</td>
                  <td>{fmtDate(b.startDate)} → {fmtDate(b.endDate)}</td>
                  <td>{b.days}d</td>
                  <td style={{ color: 'var(--gold)' }}>${b.totalPrice}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fleet table */}
        <div className="admin-fleet-header">
          <h3 className="admin-section-title">Fleet Management</h3>
          <button className="btn-gold" onClick={() => setShowAddCar(true)}>+ Add Car</button>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vehicle</th><th>Category</th><th>Price/Day</th>
                <th>Fuel</th><th>Available</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">No vehicles yet — add your first car!</td></tr>
              ) : cars.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.make} {c.model}</strong>{' '}
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{c.year}</span>
                  </td>
                  <td><span className="car-category">{c.category}</span></td>
                  <td style={{ color: 'var(--gold)' }}>${c.pricePerDay}</td>
                  <td>{fuelIcon(c.fuel)} {c.fuel}</td>
                  <td>
                    <span className={`badge ${c.available ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {c.available ? 'Available' : 'Rented'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-cancel" onClick={() => deleteCar(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddCar && (
        <AddCarModal
          onClose={() => setShowAddCar(false)}
          showToast={showToast}
          onAdded={load}
        />
      )}
    </div>
  )
}