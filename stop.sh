#!/bin/bash

# ComptaPro Stop Script
echo "⏹️ إيقاف ComptaPro..."

# Kill by PID if exists
if [ -f comptapro.pid ]; then
    PID=$(cat comptapro.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "✅ تم إيقاف العملية: $PID"
    else
        echo "⚠️ العملية غير موجودة: $PID"
    fi
    rm -f comptapro.pid
fi

# Kill any remaining Flask processes
pkill -f "python.*app.py" 2>/dev/null && echo "🔄 تم إيقاف العمليات الإضافية"

# Check if port 5000 is still in use
if lsof -i:5000 > /dev/null 2>&1; then
    echo "⚠️ المنفذ 5000 ما زال مستخدماً"
    echo "🔍 العمليات المستخدمة للمنفذ 5000:"
    lsof -i:5000
else
    echo "✅ المنفذ 5000 متاح الآن"
fi

echo "🏁 تم إيقاف ComptaPro"
