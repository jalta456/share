// ComptaPro - Simple and Clean JavaScript
console.log('🚀 ComptaPro تم تحميله');

// Global data
let appData = {
    customers: [],
    products: [],
    invoices: []
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ الصفحة جاهزة');
    loadData();
    setupTabs();
});

// === BUTTON FUNCTIONS (Simple and Direct) ===

function showAddCustomerModal() {
    console.log('🔘 فتح نموذج العميل');
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
    document.getElementById('customerName').focus();
}

function showCreateInvoiceModal() {
    console.log('🔘 فتح نموذج الفاتورة');
    const modal = new bootstrap.Modal(document.getElementById('createInvoiceModal'));
    populateCustomerSelects();
    populateProductSelects();
    modal.show();
}

function generateRandomInvoice() {
    console.log('🔘 إنشاء فاتورة تلقائية');
    
    if (appData.customers.length === 0) {
        alert('يرجى إضافة عميل واحد على الأقل');
        return;
    }
    
    if (appData.products.length === 0) {
        alert('يرجى إضافة منتج واحد على الأقل');
        return;
    }
    
    // Generate random invoice
    const randomCustomer = appData.customers[Math.floor(Math.random() * appData.customers.length)];
    const randomProduct = appData.products[Math.floor(Math.random() * appData.products.length)];
    
    const targetTotal = 4000 + Math.random() * 1000;
    const quantity = Math.ceil(targetTotal / (randomProduct.price * 1.20));
    const subtotal = randomProduct.price * quantity;
    const tax = subtotal * 0.20;
    const total = subtotal + tax;
    
    const invoiceData = {
        customer_id: randomCustomer.id,
        items: [{
            product_id: randomProduct.id,
            product_name: randomProduct.name,
            quantity: quantity,
            price: randomProduct.price,
            total: subtotal
        }],
        subtotal: subtotal,
        tax: tax,
        total: total
    };
    
    createInvoiceAPI(invoiceData);
}

async function addCustomer() {
    console.log('🔘 حفظ عميل');
    
    const name = document.getElementById('customerName').value.trim();
    const ice = document.getElementById('customerICE').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();

    if (!name) {
        alert('اسم العميل مطلوب');
        return;
    }

    if (ice && (ice.length !== 15 || !/^\d+$/.test(ice))) {
        alert('رقم ICE يجب أن يكون 15 رقماً');
        return;
    }

    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, ice, phone, address })
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            appData.customers.push(result.customer);
            updateDashboard();
            populateCustomerSelects();
            renderCustomersTable();
            
            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
            document.getElementById('addCustomerForm').reset();
            
            alert('تم إضافة العميل بنجاح');
        } else {
            alert(result.error || 'فشل في إضافة العميل');
        }
    } catch (error) {
        console.error('خطأ:', error);
        alert('خطأ في الاتصال بالخادم');
    }
}

async function deleteCustomer(customerId) {
    console.log('🔘 حذف عميل:', customerId);
    
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        return;
    }

    try {
        const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (response.ok && result.success) {
            appData.customers = appData.customers.filter(c => c.id !== customerId);
            updateDashboard();
            populateCustomerSelects();
            renderCustomersTable();
            alert('تم حذف العميل بنجاح');
        } else {
            alert(result.error || 'فشل في حذف العميل');
        }
    } catch (error) {
        console.error('خطأ:', error);
        alert('خطأ في الاتصال بالخادم');
    }
}

function showAddProductModal() {
    alert('ميزة إضافة المنتجات قيد التطوير');
}

// === HELPER FUNCTIONS ===

async function loadData() {
    try {
        const response = await fetch('/api/data');
        if (response.ok) {
            appData = await response.json();
            updateDashboard();
            populateCustomerSelects();
            populateProductSelects();
            console.log('✅ تم تحميل البيانات');
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

function updateDashboard() {
    document.getElementById('customersCount').textContent = appData.customers.length;
    document.getElementById('productsCount').textContent = appData.products.length;
    document.getElementById('invoicesCount').textContent = appData.invoices.length;
}

function setupTabs() {
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('data-bs-target');
            if (target === '#customers') {
                renderCustomersTable();
            } else if (target === '#products') {
                renderProductsTable();
            } else if (target === '#invoices') {
                renderInvoicesTable();
            }
        });
    });
}

function populateCustomerSelects() {
    const selects = document.querySelectorAll('#invoiceCustomer');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="">اختر العميل...</option>
            <option value="new">+ إضافة عميل جديد</option>
        `;
        
        appData.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

function populateProductSelects() {
    const selects = document.querySelectorAll('.item-product');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">اختر المنتج...</option>';
        
        appData.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${product.price} درهم`;
            option.dataset.price = product.price;
            select.appendChild(option);
        });
        
        select.value = currentValue;
    });
}

async function createInvoiceAPI(invoiceData) {
    try {
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            appData.invoices.push(result.invoice);
            updateDashboard();
            renderInvoicesTable();
            alert(`تم إنشاء فاتورة بقيمة ${invoiceData.total.toFixed(2)} درهم`);
        } else {
            alert(result.error || 'فشل في إنشاء الفاتورة');
        }
    } catch (error) {
        console.error('خطأ:', error);
        alert('خطأ في الاتصال بالخادم');
    }
}

// === RENDER FUNCTIONS ===

function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    appData.customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.ice || '-'}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    appData.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price} درهم</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderInvoicesTable() {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appData.invoices.forEach(invoice => {
        const customer = appData.customers.find(c => c.id === invoice.customer_id);
        const date = new Date(invoice.date).toLocaleDateString('ar-MA');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.number}</td>
            <td>${date}</td>
            <td>${customer ? customer.name : 'غير محدد'}</td>
            <td>${invoice.total.toFixed(2)} درهم</td>
            <td>
                <button class="btn btn-primary btn-sm me-1" onclick="viewInvoice('${invoice.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvoice('${invoice.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Invoice viewing and printing functions
function viewInvoice(invoiceId) {
    console.log('🔘 عرض فاتورة:', invoiceId);

    const invoice = appData.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
        alert('الفاتورة غير موجودة');
        return;
    }

    const customer = appData.customers.find(c => c.id === invoice.customer_id);
    const date = new Date(invoice.date).toLocaleDateString('ar-MA');

    const invoiceHTML = `
        <div class="invoice-header">
            <h2>🧾 ComptaPro</h2>
            <h4>فاتورة رقم: ${invoice.number}</h4>
            <p>التاريخ: ${date}</p>
        </div>

        <div class="invoice-info">
            <div>
                <h5>معلومات العميل:</h5>
                <p><strong>الاسم:</strong> ${customer ? customer.name : 'غير محدد'}</p>
                <p><strong>رقم ICE:</strong> ${customer && customer.ice ? customer.ice : '-'}</p>
                <p><strong>الهاتف:</strong> ${customer && customer.phone ? customer.phone : '-'}</p>
                <p><strong>العنوان:</strong> ${customer && customer.address ? customer.address : '-'}</p>
            </div>
            <div>
                <h5>معلومات الفاتورة:</h5>
                <p><strong>رقم الفاتورة:</strong> ${invoice.number}</p>
                <p><strong>التاريخ:</strong> ${date}</p>
                <p><strong>الحالة:</strong> مدفوعة</p>
            </div>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>المنتج/الخدمة</th>
                    <th>الكمية</th>
                    <th>السعر الوحدة</th>
                    <th>المجموع</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)} درهم</td>
                        <td>${item.total.toFixed(2)} درهم</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="invoice-total">
            <table>
                <tr>
                    <td>المجموع الفرعي:</td>
                    <td>${invoice.subtotal.toFixed(2)} درهم</td>
                </tr>
                <tr>
                    <td>الضريبة (20%):</td>
                    <td>${invoice.tax.toFixed(2)} درهم</td>
                </tr>
                <tr class="total-row">
                    <td><strong>المجموع الإجمالي:</strong></td>
                    <td><strong>${invoice.total.toFixed(2)} درهم</strong></td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p>شكراً لتعاملكم معنا</p>
            <p>ComptaPro - نظام إدارة الفواتير</p>
        </div>
    `;

    document.getElementById('invoiceContent').innerHTML = invoiceHTML;

    const modal = new bootstrap.Modal(document.getElementById('viewInvoiceModal'));
    modal.show();
}

function printInvoice() {
    console.log('🔘 طباعة فاتورة');
    window.print();
}

function copyInvoice() {
    console.log('🔘 نسخ فاتورة');

    const invoiceContent = document.getElementById('invoiceContent');
    const textContent = invoiceContent.innerText;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textContent).then(() => {
            alert('تم نسخ الفاتورة إلى الحافظة');
        }).catch(() => {
            fallbackCopyTextToClipboard(textContent);
        });
    } else {
        fallbackCopyTextToClipboard(textContent);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        alert('تم نسخ الفاتورة إلى الحافظة');
    } catch (err) {
        alert('فشل في نسخ الفاتورة');
    }

    document.body.removeChild(textArea);
}

function downloadInvoice() {
    console.log('🔘 تحميل فاتورة PDF');

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    const invoiceContent = document.getElementById('invoiceContent').innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة - ComptaPro</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-content { max-width: 800px; margin: 0 auto; }
                .invoice-header { text-align: center; border-bottom: 2px solid #4facfe; padding-bottom: 20px; margin-bottom: 30px; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                .invoice-table th { background: #f8f9fa; font-weight: bold; }
                .invoice-total { text-align: left; margin-top: 20px; }
                .invoice-total table { margin-right: auto; width: 300px; }
                .invoice-total td { padding: 8px 15px; border: 1px solid #ddd; }
                .total-row { background: #4facfe; color: white; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="invoice-content">
                ${invoiceContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 1000);
                }
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

async function deleteInvoice(invoiceId) {
    console.log('🔘 حذف فاتورة:', invoiceId);

    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        return;
    }

    // For now, just remove from local data (you can add API call later)
    appData.invoices = appData.invoices.filter(inv => inv.id !== invoiceId);
    updateDashboard();
    renderInvoicesTable();
    alert('تم حذف الفاتورة بنجاح');
}

console.log('✅ جميع الدوال جاهزة');
