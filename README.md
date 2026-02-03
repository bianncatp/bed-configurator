# Bed Configurator - Complete Setup Guide

A professional 3D bed configurator with Three.js, React, MySQL database, and PDF generation.

## Features

- ✨ Interactive 3D bed visualization using Three.js
- 🎨 Material and color customization for frame (CadruPat) and headboard (CapatPat)
- 📏 Dynamic resizing with real-time preview
- 💰 Automatic price calculation based on materials and dimensions
- 🗄️ MySQL database storage for configurations
- 📄 Professional PDF offer generation
- 🎯 Minimalist, elegant UI design

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** or **yarn** package manager

## Project Structure

```
bed-configurator/
├── frontend/
│   ├── src/
│   │   ├── bed-configurator.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── Bed.glb
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
```

## Installation Steps

### 1. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database (optional - server will do this automatically)
CREATE DATABASE bed_configurator;

# Create user (recommended)
CREATE USER 'bedconfig'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bed_configurator.* TO 'bedconfig'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Setup Backend

```bash
# Create backend directory
mkdir bed-configurator
cd bed-configurator
mkdir backend
cd backend

# Copy server.js and package-backend.json (rename to package.json)
# Update MySQL credentials in server.js:

# Edit server.js and update:
const dbConfig = {
  host: 'localhost',
  user: 'bedconfig',  # or 'root'
  password: 'your_secure_password',
  database: 'bed_configurator'
};

# Install dependencies
npm install

# Start the backend server
npm start
# Or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:3001`

### 3. Setup Frontend

```bash
# Go back to project root
cd ..
mkdir frontend
cd frontend

# Copy all frontend files:
# - index.html
# - package.json
# - vite.config.js
# Create src/ directory and copy:
# - src/main.jsx
# - src/bed-configurator.jsx

# Create public directory and copy Bed.glb
mkdir public
# Copy Bed.glb to public/

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Configuration

### Material Pricing

Edit the pricing in `bed-configurator.jsx`:

```javascript
basePrices: {
  wood: 50,      // Price per unit for wood frame
  metal: 120,    // Price per unit for metal frame
  fabric: 75,    // Price per unit for fabric headboard
  leather: 200   // Price per unit for leather headboard
}
```

### Available Materials

**Frame (CadruPat):**
- Wood - Classic wooden frame
- Metal - Modern metal frame

**Headboard (CapatPat):**
- Fabric - Soft upholstered headboard
- Leather - Premium leather headboard

### Color Options

Colors are pre-configured for each material type:
- Wood: Walnut, Oak, Cherry, Mahogany
- Metal: Black, Silver, Gold, Bronze
- Fabric: Beige, Gray, Navy, Cream
- Leather: Brown, Black, White, Tan

## Using the Application

### 1. Select Component
- Click on "Frame (Cadru)" or "Headboard (Capăt)" in the left panel
- Or use the clickable buttons in the right panel

### 2. Choose Material
- Select material type (affects pricing and appearance)
- Each material has a different price per unit

### 3. Pick Color
- Choose from available colors for the selected material
- Colors update in real-time on the 3D model

### 4. Adjust Dimensions
- Use sliders to resize:
  - Width: 80-250 cm
  - Height: 80-250 cm
  - Length: 80-250 cm
- Price updates automatically based on size

### 5. Save & Export
- **Save Configuration**: Stores to MySQL database
- **Download Offer (PDF)**: Generates professional PDF with all details

## API Endpoints

The backend provides the following REST API endpoints:

### POST `/api/save-config`
Save a bed configuration to the database.

**Request Body:**
```json
{
  "config": {
    "cadruPat": {
      "material": "wood",
      "color": "#8B4513",
      "pricePerUnit": 50
    },
    "capatPat": {
      "material": "fabric",
      "color": "#D2B48C",
      "pricePerUnit": 75
    },
    "dimensions": {
      "width": 160,
      "height": 120,
      "length": 200
    }
  },
  "totalPrice": 495
}
```

### GET `/api/configurations`
Retrieve all saved configurations.

### GET `/api/configurations/:id`
Retrieve a specific configuration by ID.

### POST `/api/generate-offer`
Generate and download a PDF offer.

### DELETE `/api/configurations/:id`
Delete a configuration by ID.

### GET `/api/health`
Health check endpoint.

## Database Schema

The `configurations` table structure:

```sql
CREATE TABLE configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cadru_material VARCHAR(50),
  cadru_color VARCHAR(20),
  cadru_price_per_unit DECIMAL(10, 2),
  capat_material VARCHAR(50),
  capat_color VARCHAR(20),
  capat_price_per_unit DECIMAL(10, 2),
  width INT,
  height INT,
  length INT,
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);
```

## Troubleshooting

### Backend won't start
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `server.js`
- Check port 3001 is available

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `server.js`
- Verify API URL in `bed-configurator.jsx`

### 3D model not loading
- Ensure `Bed.glb` is in `public/` directory
- Check browser console for errors
- Verify file path in component

### PDF generation fails
- Ensure backend has jsPDF installed
- Check backend logs for errors
- Verify API endpoint is reachable

## Customization

### Change UI Colors

Edit CSS variables in `bed-configurator.jsx`:

```javascript
backgroundColor: '#FAF9F6',  // Main background
color: '#1a1a1a',             // Primary text
borderColor: '#E8E8E8'        // Borders
```

### Add New Materials

1. Add to materials object:
```javascript
materials: {
  cadruPat: [
    { name: 'plastic', label: 'Plastic', price: 30 }
  ]
}
```

2. Add colors for new material:
```javascript
colors: {
  plastic: [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' }
  ]
}
```

### Modify 3D Appearance

Edit material properties in `BedModel` component:

```javascript
const material = new THREE.MeshStandardMaterial({
  color: config.cadruPat.color,
  metalness: 0.8,  // 0-1, higher = more metallic
  roughness: 0.2,  // 0-1, higher = more rough
});
```

## Production Deployment

### Backend

```bash
# Set environment variables
export PORT=3001
export NODE_ENV=production

# Use process manager like PM2
npm install -g pm2
pm2 start server.js --name bed-backend

# For database, consider:
# - Using connection pooling
# - Setting up SSL
# - Implementing rate limiting
```

### Frontend

```bash
# Build for production
npm run build

# The dist/ folder contains production files
# Deploy to:
# - Vercel: vercel deploy
# - Netlify: netlify deploy
# - Your own server with nginx
```

### Environment Variables

Create `.env` files:

**Backend (.env):**
```
PORT=3001
DB_HOST=localhost
DB_USER=bedconfig
DB_PASSWORD=your_password
DB_NAME=bed_configurator
NODE_ENV=production
```

**Frontend (.env):**
```
VITE_API_URL=https://your-api.com
```

## Performance Optimization

- **3D Model**: Optimize GLB file size (use Blender or similar)
- **Textures**: Compress images, use appropriate sizes
- **Database**: Add indexes for frequently queried fields
- **API**: Implement caching for static data
- **Frontend**: Use React.memo for expensive components

## Security Considerations

1. **SQL Injection**: Use parameterized queries (already implemented)
2. **CORS**: Configure for production domains only
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Add rate limiting to API endpoints
5. **Authentication**: Consider adding user authentication
6. **HTTPS**: Use SSL certificates in production

## License

This project is proprietary. All rights reserved.

## Support

For issues or questions:
- Check the troubleshooting section
- Review backend logs: `pm2 logs bed-backend`
- Check browser console for frontend errors

## Version History

- **v1.0.0** - Initial release
  - 3D bed visualization
  - Material and color selection
  - MySQL database integration
  - PDF generation
  - Minimalist UI design
