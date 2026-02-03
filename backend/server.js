const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { jsPDF } = require('jspdf');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'bedconfig',
  password: 'bt.2025',
  database: 'bed_configurator'
};

// Initialize Database
async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);

    // Create configurations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configurations (
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
        camera_view VARCHAR(20) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('Database initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Get database connection
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// API: Save Configuration
app.post('/api/save-config', async (req, res) => {
  try {
    const { config, totalPrice, cameraView } = req.body;
    const connection = await getConnection();

    const [result] = await connection.execute(
      `INSERT INTO configurations 
       (cadru_material, cadru_color, cadru_price_per_unit,
        capat_material, capat_color, capat_price_per_unit,
        width, height, length, total_price, camera_view)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        config.cadruPat.material,
        config.cadruPat.color,
        config.cadruPat.pricePerUnit,
        config.capatPat.material,
        config.capatPat.color,
        config.capatPat.pricePerUnit,
        config.dimensions.width,
        config.dimensions.height,
        config.dimensions.length,
        totalPrice,
        cameraView || 'default'
      ]
    );

    await connection.end();

    res.json({
      success: true,
      configId: result.insertId,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save configuration'
    });
  }
});

// API: Get All Configurations
app.get('/api/configurations', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM configurations ORDER BY created_at DESC'
    );
    await connection.end();

    res.json({
      success: true,
      configurations: rows
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configurations'
    });
  }
});

// API: Get Configuration by ID
app.get('/api/configurations/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM configurations WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      configuration: rows[0]
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch configuration'
    });
  }
});

// API: Generate PDF Offer
app.post('/api/generate-offer', async (req, res) => {
  try {
    const { config, totalPrice, date } = req.body;
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Header
    doc.setFontSize(24);
    doc.setTextColor(26, 26, 26);
    doc.text('BED CONFIGURATION OFFER', 105, 30, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 105, 40, { align: 'center' });

    // Horizontal line
    doc.setDrawColor(232, 232, 232);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    // Configuration Details
    let yPos = 65;

    // Frame (CadruPat) Section
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.text('FRAME (Cadru)', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    doc.text(`Material: ${config.cadruPat.material.toUpperCase()}`, 25, yPos);
    yPos += 7;
    doc.text(`Color: ${config.cadruPat.color}`, 25, yPos);
    yPos += 7;
    doc.text(`Price per unit: $${config.cadruPat.pricePerUnit}`, 25, yPos);
    yPos += 7;

    const cadruTotal = Math.round(
      config.cadruPat.pricePerUnit *
      (config.dimensions.width / 100) *
      (config.dimensions.length / 100)
    );
    doc.setFontSize(12);
    doc.setTextColor(26, 26, 26);
    doc.text(`Subtotal: $${cadruTotal}`, 25, yPos);
    yPos += 15;

    // Headboard (CapatPat) Section
    doc.setFontSize(16);
    doc.text('HEADBOARD (Capat)', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    doc.text(`Material: ${config.capatPat.material.toUpperCase()}`, 25, yPos);
    yPos += 7;
    doc.text(`Color: ${config.capatPat.color}`, 25, yPos);
    yPos += 7;
    doc.text(`Price per unit: $${config.capatPat.pricePerUnit}`, 25, yPos);
    yPos += 7;

    const capatTotal = Math.round(
      config.capatPat.pricePerUnit *
      (config.dimensions.width / 100) *
      (config.dimensions.height / 100)
    );
    doc.setFontSize(12);
    doc.setTextColor(26, 26, 26);
    doc.text(`Subtotal: $${capatTotal}`, 25, yPos);
    yPos += 15;

    // Dimensions Section
    doc.setFontSize(16);
    doc.text('DIMENSIONS', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    doc.text(`Width: ${config.dimensions.width} cm`, 25, yPos);
    yPos += 7;
    doc.text(`Height: ${config.dimensions.height} cm`, 25, yPos);
    yPos += 7;
    doc.text(`Length: ${config.dimensions.length} cm`, 25, yPos);
    yPos += 20;

    // Total Price Section
    doc.setDrawColor(26, 26, 26);
    doc.setLineWidth(1);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(18);
    doc.setTextColor(26, 26, 26);
    doc.text('TOTAL PRICE', 20, yPos);
    doc.text(`$${totalPrice}`, 190, yPos, { align: 'right' });
    yPos += 5;

    doc.setLineWidth(1);
    doc.line(20, yPos, 190, yPos);

    // Footer
    yPos = 270;
    doc.setFontSize(9);
    doc.setTextColor(153, 153, 153);
    doc.text('This offer is valid for 30 days from the date of issue.', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('For questions, please contact us at info@bedconfigurator.com', 105, yPos, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bed-offer-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
});

// API: Delete Configuration
app.delete('/api/configurations/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM configurations WHERE id = ?',
      [req.params.id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete configuration'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3001;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
});

module.exports = app;
