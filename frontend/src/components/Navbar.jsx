import { useAuth } from '../context/AuthContext'
import '../styles/navbar.css'

export default function Navbar({ page, navigate, openModal }) {
  const { currentUser, logout } = useAuth()

  const initials = currentUser
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : ''

  const handleLogout = () => {
    logout()
    navigate('home')
  }

  return (
    <nav>
      <div className="logo" onClick={() => navigate('home')}>
        Drive<span>Elite</span>
      </div>

      <div className="nav-links">
        <button className={`nav-btn ${page === 'home'  ? 'active' : ''}`} onClick={() => navigate('home')}>Home</button>
        <button className={`nav-btn ${page === 'fleet' ? 'active' : ''}`} onClick={() => navigate('fleet')}>Fleet</button>
        <button className={`nav-btn ${page === 'about' ? 'active' : ''}`} onClick={() => navigate('about')}>About</button>
        {currentUser && (
          <button className={`nav-btn ${page === 'bookings' ? 'active' : ''}`} onClick={() => navigate('bookings')}>
            My Bookings
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button className={`nav-btn ${page === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')}>
            Admin
          </button>
        )}
      </div>

      <div className="nav-auth">
        {currentUser ? (
          <div className="user-menu">
            <div className="user-avatar" title={currentUser.name}>{initials}</div>
            <span className="user-name">{currentUser.name.split(' ')[0]}</span>
            <button className="nav-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <div className="nav-links">
            <button className="nav-btn" onClick={() => openModal('login')}>Sign In</button>
            <button className="btn-gold" onClick={() => openModal('register')}>Register</button>
          </div>
        )}
      </div>
    </nav>
  )
}