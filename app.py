from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)

# ملف البيانات
DATA_FILE = 'data.json'

def load_data():
    """تحميل البيانات من الملف"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    
    # البيانات الافتراضية
    return {
        'customers': [
            {
                'id': '1',
                'name': 'شركة المثال',
                'ice': '123456789012345',
                'phone': '0612345678',
                'address': 'الدار البيضاء، المغرب'
            }
        ],
        'products': [
            {
                'id': '1',
                'name': 'منتج تجريبي',
                'price': 100.0,
                'stock': 50
            }
        ],
        'invoices': []
    }

def save_data(data):
    """حفظ البيانات في الملف"""
    try:
        # إنشاء نسخة احتياطية
        if os.path.exists(DATA_FILE):
            backup_name = f"backups/data_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            os.makedirs('backups', exist_ok=True)
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                backup_data = f.read()
            with open(backup_name, 'w', encoding='utf-8') as f:
                f.write(backup_data)
        
        # حفظ البيانات الجديدة
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"خطأ في حفظ البيانات: {e}")
        return False

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    """إرجاع جميع البيانات"""
    data = load_data()
    return jsonify(data)

@app.route('/api/customers', methods=['POST'])
def add_customer():
    """إضافة عميل جديد"""
    try:
        data = load_data()
        customer_data = request.json
        
        # التحقق من البيانات المطلوبة
        if not customer_data.get('name'):
            return jsonify({'error': 'اسم العميل مطلوب'}), 400
        
        # التحقق من عدم تكرار ICE
        ice = customer_data.get('ice', '').strip()
        if ice:
            for customer in data['customers']:
                if customer.get('ice') == ice:
                    return jsonify({'error': 'رقم ICE موجود مسبقاً'}), 400
        
        # إنشاء عميل جديد
        new_customer = {
            'id': str(uuid.uuid4()),
            'name': customer_data['name'].strip(),
            'ice': ice,
            'phone': customer_data.get('phone', '').strip(),
            'address': customer_data.get('address', '').strip()
        }
        
        data['customers'].append(new_customer)
        
        if save_data(data):
            return jsonify({'success': True, 'customer': new_customer})
        else:
            return jsonify({'error': 'فشل في حفظ البيانات'}), 500
            
    except Exception as e:
        return jsonify({'error': f'خطأ في الخادم: {str(e)}'}), 500

@app.route('/api/customers/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """تحديث بيانات عميل"""
    try:
        data = load_data()
        customer_data = request.json
        
        # البحث عن العميل
        customer_index = None
        for i, customer in enumerate(data['customers']):
            if customer['id'] == customer_id:
                customer_index = i
                break
        
        if customer_index is None:
            return jsonify({'error': 'العميل غير موجود'}), 404
        
        # تحديث البيانات
        data['customers'][customer_index].update(customer_data)
        
        if save_data(data):
            return jsonify({'success': True, 'customer': data['customers'][customer_index]})
        else:
            return jsonify({'error': 'فشل في حفظ البيانات'}), 500
            
    except Exception as e:
        return jsonify({'error': f'خطأ في الخادم: {str(e)}'}), 500

@app.route('/api/customers/<customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    """حذف عميل"""
    try:
        data = load_data()
        
        # البحث عن العميل وحذفه
        original_count = len(data['customers'])
        data['customers'] = [c for c in data['customers'] if c['id'] != customer_id]
        
        if len(data['customers']) == original_count:
            return jsonify({'error': 'العميل غير موجود'}), 404
        
        if save_data(data):
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'فشل في حفظ البيانات'}), 500
            
    except Exception as e:
        return jsonify({'error': f'خطأ في الخادم: {str(e)}'}), 500

@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    """إنشاء فاتورة جديدة"""
    try:
        data = load_data()
        invoice_data = request.json
        
        # إنشاء فاتورة جديدة
        new_invoice = {
            'id': str(uuid.uuid4()),
            'number': f"INV-{len(data['invoices']) + 1:04d}",
            'date': datetime.now().isoformat(),
            'customer_id': invoice_data['customer_id'],
            'items': invoice_data['items'],
            'subtotal': invoice_data['subtotal'],
            'tax': invoice_data['tax'],
            'total': invoice_data['total']
        }
        
        data['invoices'].append(new_invoice)
        
        if save_data(data):
            return jsonify({'success': True, 'invoice': new_invoice})
        else:
            return jsonify({'error': 'فشل في حفظ البيانات'}), 500
            
    except Exception as e:
        return jsonify({'error': f'خطأ في الخادم: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 بدء تشغيل ComptaPro...")
    print("📊 الوصول للتطبيق: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
