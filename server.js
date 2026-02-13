import express from 'express';
import cors from 'cors';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// PDF Generation endpoint
app.post('/api/generate-offer', async (req, res) => {
  try {
    const { config, totalPrice, cameraView, date } = req.body;

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bed-offer.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);

    // Define colors (matching the luxury theme)
    const colors = {
      black: '#0A0A0A',
      gold: '#B8A88A',
      beige: '#E5DED3',
      textSecondary: '#6B6456',
      textTertiary: '#8B7D6B'
    };

    // ==========================================
    // HEADER SECTION
    // ==========================================
    doc.fontSize(36)
       .fillColor(colors.black)
       .font('Helvetica-Light')
       .text('BED ATELIER', 60, 60);

    // Decorative line
    doc.moveTo(60, 110)
       .lineTo(120, 110)
       .strokeColor(colors.gold)
       .lineWidth(1)
       .stroke();

    // Subtitle
    doc.fontSize(11)
       .fillColor(colors.textSecondary)
       .font('Helvetica')
       .text('CUSTOM BED PROPOSAL', 60, 125);

    // Date and proposal number
    doc.fontSize(9)
       .fillColor(colors.textTertiary)
       .text(`Date: ${formatDate(date)}`, 400, 70, { align: 'right' })
       .text(`Proposal #${Date.now().toString().slice(-6)}`, 400, 85, { align: 'right' });

    // Horizontal divider
    doc.moveTo(60, 160)
       .lineTo(535, 160)
       .strokeColor(colors.beige)
       .lineWidth(1)
       .stroke();

    // ==========================================
    // CONFIGURATION DETAILS
    // ==========================================
    let yPosition = 190;

    // Section title
    doc.fontSize(12)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text('CONFIGURATION DETAILS', 60, yPosition);

    yPosition += 30;

    // Frame (Cadru Pat) Section
    doc.fontSize(10)
       .fillColor(colors.textTertiary)
       .font('Helvetica')
       .text('FRAME (CADRU PAT)', 60, yPosition);

    yPosition += 20;

    // Material badge
    doc.roundedRect(60, yPosition, 80, 25, 2)
       .fillAndStroke(colors.beige, colors.gold);

    doc.fontSize(9)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text(capitalize(config.cadruPat.material), 70, yPosition + 8);

    // Color swatch
    doc.rect(160, yPosition, 25, 25)
       .fillAndStroke(config.cadruPat.color, colors.gold);

    doc.fontSize(9)
       .fillColor(colors.textSecondary)
       .font('Helvetica')
       .text('Color', 195, yPosition + 8);

    // Price
    doc.fontSize(10)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text(`$${config.cadruPat.pricePerUnit}/unit`, 450, yPosition + 8, { align: 'right' });

    yPosition += 45;

    // Headboard (Capat Pat) Section
    doc.fontSize(10)
       .fillColor(colors.textTertiary)
       .font('Helvetica')
       .text('HEADBOARD (CAPĂT PAT)', 60, yPosition);

    yPosition += 20;

    // Material badge
    doc.roundedRect(60, yPosition, 80, 25, 2)
       .fillAndStroke(colors.beige, colors.gold);

    doc.fontSize(9)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text(capitalize(config.capatPat.material), 70, yPosition + 8);

    // Color swatch
    doc.rect(160, yPosition, 25, 25)
       .fillAndStroke(config.capatPat.color, colors.gold);

    doc.fontSize(9)
       .fillColor(colors.textSecondary)
       .font('Helvetica')
       .text('Color', 195, yPosition + 8);

    // Price
    doc.fontSize(10)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text(`$${config.capatPat.pricePerUnit}/unit`, 450, yPosition + 8, { align: 'right' });

    yPosition += 45;

    // Horizontal divider
    doc.moveTo(60, yPosition)
       .lineTo(535, yPosition)
       .strokeColor(colors.beige)
       .lineWidth(1)
       .stroke();

    yPosition += 30;

    // ==========================================
    // DIMENSIONS SECTION
    // ==========================================
    doc.fontSize(12)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text('DIMENSIONS', 60, yPosition);

    yPosition += 30;

    // Dimensions table
    const dimensionLabels = ['Width', 'Height', 'Length'];
    const dimensionKeys = ['width', 'height', 'length'];
    const columnWidth = 150;

    dimensionLabels.forEach((label, index) => {
      const xPos = 60 + (index * columnWidth);
      
      doc.fontSize(9)
         .fillColor(colors.textTertiary)
         .font('Helvetica')
         .text(label, xPos, yPosition);

      doc.fontSize(16)
         .fillColor(colors.black)
         .font('Helvetica-Light')
         .text(`${config.dimensions[dimensionKeys[index]]} cm`, xPos, yPosition + 15);
    });

    yPosition += 60;

    // Horizontal divider
    doc.moveTo(60, yPosition)
       .lineTo(535, yPosition)
       .strokeColor(colors.beige)
       .lineWidth(1)
       .stroke();

    yPosition += 30;

    // ==========================================
    // PRICE BREAKDOWN
    // ==========================================
    doc.fontSize(12)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text('INVESTMENT BREAKDOWN', 60, yPosition);

    yPosition += 30;

    // Calculate individual prices
    const cadruPrice = Math.round(
      config.cadruPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.length / 100)
    );

    const capatPrice = Math.round(
      config.capatPat.pricePerUnit * 
      (config.dimensions.width / 100) * 
      (config.dimensions.height / 100)
    );

    // Price items
    const priceItems = [
      { 
        label: `Frame (${capitalize(config.cadruPat.material)})`, 
        calculation: `${config.cadruPat.pricePerUnit} × ${(config.dimensions.width / 100).toFixed(2)} × ${(config.dimensions.length / 100).toFixed(2)}`,
        price: cadruPrice 
      },
      { 
        label: `Headboard (${capitalize(config.capatPat.material)})`, 
        calculation: `${config.capatPat.pricePerUnit} × ${(config.dimensions.width / 100).toFixed(2)} × ${(config.dimensions.height / 100).toFixed(2)}`,
        price: capatPrice 
      }
    ];

    priceItems.forEach(item => {
      doc.fontSize(10)
         .fillColor(colors.textSecondary)
         .font('Helvetica')
         .text(item.label, 60, yPosition);

      doc.fontSize(8)
         .fillColor(colors.textTertiary)
         .text(item.calculation, 60, yPosition + 15);

      doc.fontSize(10)
         .fillColor(colors.black)
         .font('Helvetica-Bold')
         .text(`$${item.price}`, 450, yPosition, { align: 'right' });

      yPosition += 40;
    });

    // Total price section
    yPosition += 10;

    doc.rect(60, yPosition, 475, 60)
       .fillAndStroke(colors.black, colors.black);

    doc.fontSize(10)
       .fillColor(colors.gold)
       .font('Helvetica')
       .text('TOTAL INVESTMENT', 80, yPosition + 15);

    doc.fontSize(28)
       .fillColor('#FFFFFF')
       .font('Helvetica-Light')
       .text(`$${totalPrice}`, 350, yPosition + 18, { align: 'right' });

    yPosition += 80;

    // ==========================================
    // SPECIFICATIONS SECTION
    // ==========================================
    doc.fontSize(12)
       .fillColor(colors.black)
       .font('Helvetica-Bold')
       .text('SPECIFICATIONS', 60, yPosition);

    yPosition += 25;

    const specifications = [
      'Premium upholstery materials',
      'Handcrafted construction',
      'Sustainable sourcing',
      'Made to order',
      '2-year warranty included',
      'White glove delivery available'
    ];

    specifications.forEach(spec => {
      doc.fontSize(9)
         .fillColor(colors.textSecondary)
         .font('Helvetica')
         .text('•  ' + spec, 60, yPosition);
      yPosition += 16;
    });

    yPosition += 20;

    // ==========================================
    // FOOTER
    // ==========================================
    const footerY = 750;

    // Footer divider
    doc.moveTo(60, footerY)
       .lineTo(535, footerY)
       .strokeColor(colors.beige)
       .lineWidth(1)
       .stroke();

    // Footer text
    doc.fontSize(8)
       .fillColor(colors.textTertiary)
       .font('Helvetica')
       .text('BED ATELIER  •  Atelier Collection 2026', 60, footerY + 15)
       .text('This proposal is valid for 30 days from the date of issue.', 60, footerY + 28);

    doc.fontSize(8)
       .text('Page 1 of 1', 450, footerY + 15, { align: 'right' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Save configuration endpoint
app.post('/api/save-config', async (req, res) => {
  try {
    const { config, totalPrice, cameraView, createdAt } = req.body;

    // Create configurations directory if it doesn't exist
    const configDir = path.join(__dirname, 'configurations');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `config-${Date.now()}.json`;
    const filepath = path.join(configDir, filename);

    // Prepare data to save
    const configData = {
      config,
      totalPrice,
      cameraView,
      createdAt,
      id: Date.now().toString()
    };

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(configData, null, 2));

    res.json({ 
      success: true, 
      message: 'Configuration saved successfully',
      id: configData.id,
      filepath: filename
    });

  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Get all saved configurations
app.get('/api/configurations', (req, res) => {
  try {
    const configDir = path.join(__dirname, 'configurations');
    
    if (!fs.existsSync(configDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(configDir);
    const configurations = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(configDir, file);
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(configurations);

  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

// Get single configuration by ID
app.get('/api/configurations/:id', (req, res) => {
  try {
    const configDir = path.join(__dirname, 'configurations');
    const files = fs.readdirSync(configDir);
    
    const configFile = files.find(file => {
      const filepath = path.join(configDir, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      return data.id === req.params.id;
    });

    if (!configFile) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const filepath = path.join(configDir, configFile);
    const data = fs.readFileSync(filepath, 'utf8');
    res.json(JSON.parse(data));

  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Delete configuration
app.delete('/api/configurations/:id', (req, res) => {
  try {
    const configDir = path.join(__dirname, 'configurations');
    const files = fs.readdirSync(configDir);
    
    const configFile = files.find(file => {
      const filepath = path.join(configDir, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      return data.id === req.params.id;
    });

    if (!configFile) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const filepath = path.join(configDir, configFile);
    fs.unlinkSync(filepath);

    res.json({ success: true, message: 'Configuration deleted successfully' });

  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bed Configurator Backend Server running on port ${PORT}`);
  console.log(`📄 PDF Generation: http://localhost:${PORT}/api/generate-offer`);
  console.log(`💾 Save Config: http://localhost:${PORT}/api/save-config`);
});