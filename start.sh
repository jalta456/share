#!/bin/bash

echo "🚀 بدء تشغيل ComptaPro..."
echo "📦 تثبيت المتطلبات..."

# Install requirements
pip install -r requirements.txt

echo "✅ تم تثبيت المتطلبات بنجاح"
echo "🌐 بدء تشغيل الخادم..."

# Start the Flask application
python app.py
