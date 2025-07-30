#!/bin/bash

# ComptaPro Auto-Start Script
echo "🚀 بدء تشغيل ComptaPro تلقائياً..."

# Change to application directory
cd /mnt/persist/workspace

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 تثبيت Flask..."
    pip install Flask==2.3.3
fi

# Kill any existing Flask processes
echo "🔄 إيقاف العمليات السابقة..."
pkill -f "python.*app.py" 2>/dev/null || true

# Wait a moment
sleep 2

# Start the application in background
echo "▶️ تشغيل التطبيق في الخلفية..."
nohup python3 app.py > comptapro.log 2>&1 &

# Get the process ID
PID=$!
echo "✅ تم تشغيل ComptaPro بنجاح!"
echo "📊 معرف العملية: $PID"
echo "🌐 الرابط: http://localhost:5000"
echo "📝 ملف السجل: comptapro.log"

# Save PID for later use
echo $PID > comptapro.pid

# Wait a moment and check if it's running
sleep 3
if ps -p $PID > /dev/null; then
    echo "🎉 التطبيق يعمل بنجاح!"
    echo "🔗 افتح المتصفح على: http://localhost:5000"
else
    echo "❌ فشل في تشغيل التطبيق"
    echo "📋 تحقق من ملف السجل: comptapro.log"
fi
