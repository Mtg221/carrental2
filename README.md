# CarRental — Plateforme de location de voitures

Application web fullstack de location de véhicules avec système de réservation et authentification.

**Stack :** React + Vite | Node.js + Express | MongoDB + Mongoose | JWT Auth

---

## Structure du projet

```
carrental2/
├── backend/
│   ├── connection/   ← Connexion MongoDB
│   ├── middleware/   ← Auth JWT + autorisation
│   ├── models/       ← Car, Booking, User
│   ├── routes/       ← auth, cars, bookings
│   └── server.js
└── frontend/
```

---

## Démarrage rapide

```bash
# Backend
cd backend && npm install
cp .env.example .env
npm start

# Frontend
cd frontend && npm install
npm run dev
```

**`backend/.env`**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/carrental
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
```

---

## API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| GET | `/api/cars` | ❌ | Liste des voitures |
| POST | `/api/cars` | ✅ | Ajouter une voiture |
| GET | `/api/bookings` | ✅ | Mes réservations |
| POST | `/api/bookings` | ✅ | Créer une réservation |

---

## License

MIT
