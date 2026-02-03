# Project Structure Setup Guide

## Complete Directory Structure

After setting up the project, your directory structure should look like this:

```
bed-configurator/
│
├── frontend/                       # React frontend application
│   ├── public/
│   │   └── Bed.glb                # 3D bed model file
│   │
│   ├── src/
│   │   ├── bed-configurator.jsx   # Main configurator component
│   │   └── main.jsx               # React entry point
│   │
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Frontend dependencies
│   ├── .env                       # Frontend environment variables (create from .env.example)
│   └── node_modules/              # (created by npm install)
│
├── backend/                       # Node.js backend server
│   ├── server.js                  # Express server with API endpoints
│   ├── package.json               # Backend dependencies
│   ├── .env                       # Backend environment variables (create from .env.example)
│   └── node_modules/              # (created by npm install)
│
├── database-setup.sql             # MySQL database setup script
├── README.md                      # Complete documentation
├── start.sh                       # Quick start script
├── backend.env.example            # Backend environment template
├── frontend.env.example           # Frontend environment template
└── PROJECT-STRUCTURE.md           # This file

```

## Step-by-Step Setup Instructions

### 1. Create Project Directory

```bash
mkdir bed-configurator
cd bed-configurator
```

### 2. Setup Backend

```bash
# Create backend directory
mkdir backend
cd backend

# Copy or create these files:
# - server.js
# - package.json (rename from package-backend.json)

# Create .env file from template
cp ../backend.env.example .env

# Edit .env and update with your MySQL credentials
nano .env  # or use your preferred editor

# Install dependencies
npm install

# The following packages will be installed:
# - express: Web framework
# - mysql2: MySQL client
# - cors: Cross-origin resource sharing
# - jspdf: PDF generation
```

### 3. Setup Frontend

```bash
# Go back to root directory
cd ..

# Create frontend directory
mkdir -p frontend/src/public
cd frontend

# Copy or create these files in frontend/:
# - index.html
# - vite.config.js
# - package.json

# Copy or create these files in frontend/src/:
# - main.jsx
# - bed-configurator.jsx

# Copy Bed.glb to frontend/public/
cp /path/to/Bed.glb public/

# Create .env file from template
cp ../frontend.env.example .env

# Install dependencies
npm install

# The following packages will be installed:
# - react & react-dom: React framework
# - three: 3D graphics library
# - @react-three/fiber: React renderer for Three.js
# - @react-three/drei: Useful helpers for react-three-fiber
# - vite: Build tool and dev server
```

### 4. Setup Database

```bash
# Go back to root directory
cd ..

# Run the database setup script
mysql -u root -p < database-setup.sql

# Enter your MySQL root password when prompted
```

### 5. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
nano .env

# Update these values:
DB_HOST=localhost
DB_USER=bedconfig
DB_PASSWORD=your_actual_password
DB_NAME=bed_configurator
```

#### Frontend (.env)
```bash
cd ../frontend
nano .env

# Update if needed:
VITE_API_URL=http://localhost:3001
```

### 6. Start the Application

#### Option A: Using the Quick Start Script
```bash
cd ..
./start.sh

# Choose option 4 to start both servers
```

#### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/api/health

## File Descriptions

### Frontend Files

**index.html**
- Main HTML template
- Includes font imports and base styling
- Custom scrollbar and range input styling

**vite.config.js**
- Vite build configuration
- Dev server settings
- GLB file handling

**src/main.jsx**
- React application entry point
- Renders the main BedConfigurator component

**src/bed-configurator.jsx**
- Main configurator component
- 3D viewer with Three.js
- Material and color selection UI
- Dimension controls
- Price calculation
- API integration

**public/Bed.glb**
- 3D bed model file
- Loaded by Three.js GLTFLoader

### Backend Files

**server.js**
- Express server setup
- MySQL database connection
- REST API endpoints:
  - POST /api/save-config - Save configuration
  - GET /api/configurations - Get all configs
  - GET /api/configurations/:id - Get specific config
  - POST /api/generate-offer - Generate PDF
  - DELETE /api/configurations/:id - Delete config
  - GET /api/health - Health check

### Database Files

**database-setup.sql**
- Database creation
- User creation (optional)
- Table schema
- Sample data (optional)
- Indexes for performance

## Common Issues and Solutions

### Issue: Backend won't connect to MySQL

**Solution:**
1. Check MySQL is running: `systemctl status mysql` or `brew services list` (Mac)
2. Verify credentials in backend/.env
3. Test connection: `mysql -u bedconfig -p`
4. Check firewall settings

### Issue: Frontend can't reach backend

**Solution:**
1. Ensure backend is running on port 3001
2. Check CORS configuration in server.js
3. Verify VITE_API_URL in frontend/.env
4. Check browser console for errors

### Issue: 3D model not loading

**Solution:**
1. Verify Bed.glb is in frontend/public/
2. Check file permissions
3. Open browser DevTools Network tab
4. Look for 404 errors on Bed.glb

### Issue: PDF generation fails

**Solution:**
1. Check jsPDF is installed in backend
2. Verify backend logs for errors
3. Test API endpoint directly: 
   ```bash
   curl -X POST http://localhost:3001/api/generate-offer \
     -H "Content-Type: application/json" \
     -d '{"config":{...}, "totalPrice":500}'
   ```

## Development Tips

### Hot Reloading

- Frontend: Vite provides automatic hot reload
- Backend: Use `npm run dev` with nodemon for auto-restart

### Debugging

**Frontend:**
```javascript
// Add to bed-configurator.jsx
console.log('Current config:', config);
console.log('Total price:', totalPrice);
```

**Backend:**
```javascript
// Add to server.js
console.log('Received config:', req.body);
```

### Testing API Endpoints

Use curl or Postman:

```bash
# Health check
curl http://localhost:3001/api/health

# Save configuration
curl -X POST http://localhost:3001/api/save-config \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "cadruPat": {"material": "wood", "color": "#8B4513", "pricePerUnit": 50},
      "capatPat": {"material": "fabric", "color": "#D2B48C", "pricePerUnit": 75},
      "dimensions": {"width": 160, "height": 120, "length": 200}
    },
    "totalPrice": 410
  }'

# Get all configurations
curl http://localhost:3001/api/configurations
```

## Customization Guide

### Adding New Materials

1. Update materials object in bed-configurator.jsx:
```javascript
materials: {
  cadruPat: [
    { name: 'wood', label: 'Wood', price: 50 },
    { name: 'metal', label: 'Metal', price: 120 },
    { name: 'acrylic', label: 'Acrylic', price: 90 }  // NEW
  ]
}
```

2. Add colors for new material:
```javascript
colors: {
  acrylic: [
    { name: 'Clear', hex: '#FFFFFF' },
    { name: 'Tinted', hex: '#CCE5FF' }
  ]
}
```

3. Update material rendering in BedModel component

### Changing Price Calculation

Edit the useEffect in bed-configurator.jsx:

```javascript
useEffect(() => {
  // Custom pricing logic
  const cadruPrice = config.cadruPat.pricePerUnit * 
    (config.dimensions.width / 100) * 
    (config.dimensions.length / 100) *
    1.2; // Add 20% markup
  
  // ... rest of calculation
}, [config]);
```

### Modifying UI Colors

Edit the style objects in bed-configurator.jsx:

```javascript
style={{
  backgroundColor: '#YOUR_COLOR',
  color: '#YOUR_TEXT_COLOR',
  borderColor: '#YOUR_BORDER_COLOR'
}}
```

## Production Deployment Checklist

- [ ] Update MySQL credentials for production
- [ ] Set NODE_ENV=production
- [ ] Configure production database with SSL
- [ ] Build frontend: `npm run build`
- [ ] Set up reverse proxy (nginx)
- [ ] Configure CORS for production domain
- [ ] Add rate limiting to API
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Add monitoring (PM2, New Relic, etc.)

## Maintenance

### Database Backup

```bash
# Backup database
mysqldump -u bedconfig -p bed_configurator > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u bedconfig -p bed_configurator < backup_20260202.sql
```

### View Database Data

```bash
mysql -u bedconfig -p

USE bed_configurator;

# View all configurations
SELECT * FROM configurations ORDER BY created_at DESC LIMIT 10;

# View summary
SELECT * FROM configuration_summary;

# Count configurations
SELECT COUNT(*) FROM configurations;
```

### Update Dependencies

```bash
# Backend
cd backend
npm outdated
npm update

# Frontend
cd ../frontend
npm outdated
npm update
```

## Support

If you encounter issues:
1. Check the logs (browser console for frontend, terminal for backend)
2. Review the Common Issues section above
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check database connection and table structure

## Next Steps

1. Customize materials and colors for your needs
2. Adjust pricing logic
3. Modify UI theme to match your brand
4. Add user authentication if needed
5. Implement order management system
6. Add email notifications
7. Create admin dashboard for managing configurations
