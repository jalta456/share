# 🚀 دليل التشغيل التلقائي - ComptaPro

## 🎯 الهدف
تشغيل ComptaPro تلقائياً دون الحاجة لتشغيل `python app.py` يدوياً.

## 📋 الطرق المتاحة

### 1️⃣ **الطريقة السريعة (الأسهل)**
```bash
# تشغيل تلقائي
./autostart.sh

# فحص الحالة
./status.sh

# إيقاف
./stop.sh

# إعادة تشغيل
./restart.sh
```

### 2️⃣ **باستخدام Docker (الأفضل للإنتاج)**
```bash
# بناء وتشغيل
docker-compose up -d

# فحص الحالة
docker-compose ps

# إيقاف
docker-compose down

# إعادة تشغيل
docker-compose restart
```

### 3️⃣ **خدمة النظام (Linux)**
```bash
# نسخ ملف الخدمة
sudo cp comptapro.service /etc/systemd/system/

# تفعيل الخدمة
sudo systemctl enable comptapro.service

# تشغيل الخدمة
sudo systemctl start comptapro.service

# فحص الحالة
sudo systemctl status comptapro.service
```

## 🔧 **الاستخدام التفصيلي**

### ✅ **التشغيل التلقائي**
```bash
# الطريقة الأولى: سكريبت بسيط
./autostart.sh

# الطريقة الثانية: Docker
docker-compose up -d

# الطريقة الثالثة: خدمة النظام
sudo systemctl start comptapro
```

### 📊 **فحص الحالة**
```bash
# فحص شامل
./status.sh

# فحص Docker
docker-compose logs comptapro

# فحص خدمة النظام
sudo systemctl status comptapro
```

### ⏹️ **الإيقاف**
```bash
# إيقاف السكريبت
./stop.sh

# إيقاف Docker
docker-compose down

# إيقاف خدمة النظام
sudo systemctl stop comptapro
```

## 🌐 **الوصول للتطبيق**

بعد التشغيل التلقائي، يمكنك الوصول للتطبيق على:
- **الرابط الرئيسي**: http://localhost:5000
- **صفحة الاختبار**: http://localhost:5000/test.html
- **API البيانات**: http://localhost:5000/api/data

## 🔍 **استكشاف الأخطاء**

### المشكلة: التطبيق لا يعمل
```bash
# فحص الحالة
./status.sh

# فحص السجل
tail -f comptapro.log

# إعادة تشغيل
./restart.sh
```

### المشكلة: المنفذ مستخدم
```bash
# فحص المنفذ 5000
lsof -i:5000

# إيقاف العمليات
./stop.sh

# إعادة تشغيل
./autostart.sh
```

### المشكلة: خطأ في الأذونات
```bash
# إعطاء أذونات التنفيذ
chmod +x *.sh

# تشغيل مع sudo إذا لزم الأمر
sudo ./autostart.sh
```

## 📝 **الملفات المهمة**

- `autostart.sh` - تشغيل تلقائي
- `stop.sh` - إيقاف التطبيق
- `restart.sh` - إعادة تشغيل
- `status.sh` - فحص الحالة
- `comptapro.service` - خدمة النظام
- `Dockerfile` - حاوية Docker
- `docker-compose.yml` - تكوين Docker
- `comptapro.log` - ملف السجل
- `comptapro.pid` - معرف العملية

## 🎉 **التشغيل عند بدء النظام**

### Linux (systemd):
```bash
sudo systemctl enable comptapro.service
```

### Docker:
```bash
# إضافة restart: unless-stopped في docker-compose.yml
docker-compose up -d
```

## 🔒 **الأمان**

- التطبيق يعمل على جميع العناوين (0.0.0.0)
- يمكن تقييد الوصول بتغيير host في app.py
- استخدم reverse proxy للإنتاج (nginx/apache)

## 📞 **الدعم**

إذا واجهت مشاكل:
1. تحقق من `./status.sh`
2. راجع `comptapro.log`
3. جرب `./restart.sh`
4. تأكد من تثبيت Flask: `pip install Flask`

---

**الآن ComptaPro يعمل تلقائياً! 🚀**
