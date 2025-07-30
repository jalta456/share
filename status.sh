#!/bin/bash

# ComptaPro Status Script
echo "📊 حالة ComptaPro..."
echo "========================"

# Check if PID file exists
if [ -f comptapro.pid ]; then
    PID=$(cat comptapro.pid)
    echo "📝 معرف العملية المحفوظ: $PID"
    
    if ps -p $PID > /dev/null; then
        echo "✅ التطبيق يعمل (PID: $PID)"
    else
        echo "❌ العملية غير موجودة"
        rm -f comptapro.pid
    fi
else
    echo "📝 لا يوجد ملف PID"
fi

# Check for any Flask processes
FLASK_PROCESSES=$(pgrep -f "python.*app.py" 2>/dev/null)
if [ ! -z "$FLASK_PROCESSES" ]; then
    echo "🔍 عمليات Flask موجودة:"
    echo "$FLASK_PROCESSES"
else
    echo "❌ لا توجد عمليات Flask"
fi

# Check port 5000
if lsof -i:5000 > /dev/null 2>&1; then
    echo "🌐 المنفذ 5000 مستخدم:"
    lsof -i:5000
    echo "🔗 الرابط: http://localhost:5000"
else
    echo "❌ المنفذ 5000 غير مستخدم"
fi

# Check log file
if [ -f comptapro.log ]; then
    echo "📋 آخر 5 أسطر من السجل:"
    tail -5 comptapro.log
else
    echo "📋 لا يوجد ملف سجل"
fi

echo "========================"
