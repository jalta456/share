#!/usr/bin/env python3
"""
ComptaPro - تشغيل بسيط ومباشر
استخدام: python run.py
"""

import os
import sys
import subprocess
import time

def check_flask():
    """التحقق من تثبيت Flask"""
    try:
        import flask
        return True
    except ImportError:
        return False

def install_flask():
    """تثبيت Flask"""
    print("📦 تثبيت Flask...")
    subprocess.run([sys.executable, "-m", "pip", "install", "Flask==2.3.3"], check=True)
    print("✅ تم تثبيت Flask")

def kill_existing():
    """إيقاف العمليات السابقة"""
    try:
        if os.name == 'nt':  # Windows
            subprocess.run(["taskkill", "/f", "/im", "python.exe"], capture_output=True)
        else:  # Linux/Mac
            subprocess.run(["pkill", "-f", "app.py"], capture_output=True)
    except:
        pass

def main():
    print("🚀 ComptaPro - تشغيل مبسط")
    print("=" * 30)
    
    # التحقق من Flask
    if not check_flask():
        install_flask()
    
    # إيقاف العمليات السابقة
    print("🔄 إيقاف العمليات السابقة...")
    kill_existing()
    time.sleep(2)
    
    # تشغيل التطبيق
    print("▶️ تشغيل ComptaPro...")
    print("🌐 الرابط: http://localhost:5000")
    print("🧪 اختبار: http://localhost:5000/test.html")
    print("⏹️ للإيقاف: Ctrl+C")
    print("=" * 30)
    
    try:
        # تشغيل app.py
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 تم إيقاف ComptaPro")
    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == "__main__":
    main()
