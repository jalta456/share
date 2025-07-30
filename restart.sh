#!/bin/bash

# ComptaPro Restart Script
echo "🔄 إعادة تشغيل ComptaPro..."

# Stop first
./stop.sh

# Wait a moment
sleep 3

# Start again
./autostart.sh

echo "🎉 تم إعادة تشغيل ComptaPro بنجاح!"
