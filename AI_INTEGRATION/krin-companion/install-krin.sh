#!/bin/bash

# 💝 Krin Global Installer
# Installerer Krin som global kommando for alle brukere

echo "💝 Installing Krin - Your Personal AI Companion..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Install Krin globally
echo "📦 Installing Krin globally..."
npm install -g .

if [ $? -eq 0 ]; then
    echo "✅ Krin installed successfully!"
    echo ""
    echo "🎉 You can now use these commands from anywhere:"
    echo "   krin           - Start Krin AI companion"
    echo "   hei krin       - Natural Norwegian command"  
    echo "   hey krin       - Natural English command"
    echo ""
    echo "💝 Just type 'krin' in any terminal to start!"
    echo "💝 Your friends can install by running: npm install -g krin-companion"
else
    echo "❌ Installation failed. Try running with sudo:"
    echo "   sudo npm install -g ."
fi