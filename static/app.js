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
                <button class="btn btn-primary btn-sm me-1">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

console.log('✅ جميع الدوال جاهزة');
