#!/bin/bash

# Bed Configurator Quick Start Script
# This script helps you start both frontend and backend servers

echo "🛏️  Bed Configurator - Quick Start"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Please ensure MySQL is installed and running."
else
    echo "✅ MySQL is available"
fi

echo ""
echo "Choose an option:"
echo "1) Install dependencies (first time setup)"
echo "2) Start backend server"
echo "3) Start frontend development server"
echo "4) Start both (backend + frontend)"
echo "5) Setup database"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📦 Installing backend dependencies..."
        cd backend && npm install
        echo "✅ Backend dependencies installed"
        
        echo ""
        echo "📦 Installing frontend dependencies..."
        cd ../frontend && npm install
        echo "✅ Frontend dependencies installed"
        
        echo ""
        echo "🎉 All dependencies installed successfully!"
        echo "Next steps:"
        echo "  1. Setup your database (option 5)"
        echo "  2. Update backend/.env with your MySQL credentials"
        echo "  3. Start the servers (option 4)"
        ;;
    
    2)
        echo ""
        echo "🚀 Starting backend server..."
        cd backend && npm start
        ;;
    
    3)
        echo ""
        echo "🚀 Starting frontend development server..."
        cd frontend && npm run dev
        ;;
    
    4)
        echo ""
        echo "🚀 Starting both servers..."
        echo ""
        
        # Start backend in background
        cd backend && npm start &
        BACKEND_PID=$!
        echo "✅ Backend server started (PID: $BACKEND_PID)"
        
        # Wait a moment for backend to start
        sleep 2
        
        # Start frontend
        cd ../frontend && npm run dev &
        FRONTEND_PID=$!
        echo "✅ Frontend server started (PID: $FRONTEND_PID)"
        
        echo ""
        echo "🎉 Both servers are running!"
        echo "   Backend:  http://localhost:3001"
        echo "   Frontend: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Wait for user interrupt
        wait $BACKEND_PID $FRONTEND_PID
        ;;
    
    5)
        echo ""
        echo "📊 Setting up database..."
        read -p "Enter MySQL root password: " -s mysql_password
        echo ""
        
        mysql -u root -p$mysql_password < database-setup.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Database setup completed successfully!"
        else
            echo "❌ Database setup failed. Please check your MySQL credentials."
        fi
        ;;
    
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    
    *)
        echo "❌ Invalid option. Please choose 1-6."
        exit 1
        ;;
esac
