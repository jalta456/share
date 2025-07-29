// Global variables
let appData = {
    customers: [],
    products: [],
    invoices: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ComptaPro تم تحميله بنجاح');
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Tab change events
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

    // Invoice customer selection
    const invoiceCustomerSelect = document.getElementById('invoiceCustomer');
    if (invoiceCustomerSelect) {
        invoiceCustomerSelect.addEventListener('change', function() {
            const newCustomerForm = document.getElementById('newCustomerForm');
            if (this.value === 'new') {
                newCustomerForm.style.display = 'block';
                document.getElementById('newCustomerName').focus();
            } else {
                newCustomerForm.style.display = 'none';
            }
        });
    }

    // Invoice items calculation
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('item-product') || 
            e.target.classList.contains('item-quantity')) {
            updateInvoiceCalculations();
        }
    });

    // Enter key for new customer form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.getElementById('newCustomerForm').style.display === 'block') {
            e.preventDefault();
            saveNewCustomer();
        }
        if (e.key === 'Escape' && document.getElementById('newCustomerForm').style.display === 'block') {
            cancelNewCustomer();
        }
    });
}

// Load data from server
async function loadData() {
    try {
        showLoading(true);
        const response = await fetch('/api/data');
        if (response.ok) {
            appData = await response.json();
            updateDashboard();
            populateCustomerSelects();
            populateProductSelects();
            console.log('✅ تم تحميل البيانات بنجاح');
        } else {
            throw new Error('فشل في تحميل البيانات');
        }
    } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        showToast('خطأ في تحميل البيانات', 'error');
    } finally {
        showLoading(false);
    }
}

// Update dashboard statistics
function updateDashboard() {
    document.getElementById('customersCount').textContent = appData.customers.length;
    document.getElementById('productsCount').textContent = appData.products.length;
    document.getElementById('invoicesCount').textContent = appData.invoices.length;
}

// Show/hide loading spinner
function showLoading(show) {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastBody = document.getElementById('toastBody');
    
    toastBody.textContent = message;
    toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Customer functions
function showAddCustomerModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
    document.getElementById('customerName').focus();
}

async function addCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const ice = document.getElementById('customerICE').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();

    if (!name) {
        showToast('اسم العميل مطلوب', 'error');
        return;
    }

    // Validate ICE if provided
    if (ice && (ice.length !== 15 || !/^\d+$/.test(ice))) {
        showToast('رقم ICE يجب أن يكون 15 رقماً', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
            
            showToast('تم إضافة العميل بنجاح');
        } else {
            showToast(result.error || 'فشل في إضافة العميل', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
        showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteCustomer(customerId) {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            appData.customers = appData.customers.filter(c => c.id !== customerId);
            updateDashboard();
            populateCustomerSelects();
            renderCustomersTable();
            showToast('تم حذف العميل بنجاح');
        } else {
            showToast(result.error || 'فشل في حذف العميل', 'error');
        }
    } catch (error) {
        console.error('خطأ في حذف العميل:', error);
        showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
        showLoading(false);
    }
}

// Render customers table
function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    appData.customers.forEach(customer => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
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

// Populate customer select dropdowns
function populateCustomerSelects() {
    const selects = document.querySelectorAll('#invoiceCustomer');
    selects.forEach(select => {
        // Keep the first two options (empty and "new")
        const options = Array.from(select.options);
        const staticOptions = options.slice(0, 2);
        
        select.innerHTML = '';
        staticOptions.forEach(option => select.appendChild(option));
        
        // Add customer options
        appData.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            select.appendChild(option);
        });
    });
}

// Populate product select dropdowns
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

// Products table (placeholder)
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    appData.products.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
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

// Invoices table (placeholder)
function renderInvoicesTable() {
    const tbody = document.getElementById('invoicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    appData.invoices.forEach(invoice => {
        const customer = appData.customers.find(c => c.id === invoice.customer_id);
        const date = new Date(invoice.date).toLocaleDateString('ar-MA');
        
        const row = document.createElement('tr');
        row.className = 'fade-in';
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

// Invoice functions
function showCreateInvoiceModal() {
    const modal = new bootstrap.Modal(document.getElementById('createInvoiceModal'));
    populateCustomerSelects();
    populateProductSelects();
    modal.show();
}

async function saveNewCustomer() {
    const name = document.getElementById('newCustomerName').value.trim();
    const ice = document.getElementById('newCustomerICE').value.trim();
    const phone = document.getElementById('newCustomerPhone').value.trim();
    const address = document.getElementById('newCustomerAddress').value.trim();

    if (!name) {
        showToast('اسم العميل مطلوب', 'error');
        document.getElementById('newCustomerName').focus();
        return;
    }

    // Validate ICE if provided
    if (ice && (ice.length !== 15 || !/^\d+$/.test(ice))) {
        showToast('رقم ICE يجب أن يكون 15 رقماً', 'error');
        document.getElementById('newCustomerICE').focus();
        return;
    }

    try {
        showLoading(true);
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, ice, phone, address })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            appData.customers.push(result.customer);
            updateDashboard();
            populateCustomerSelects();

            // Select the new customer and hide the form
            document.getElementById('invoiceCustomer').value = result.customer.id;
            cancelNewCustomer();

            showToast('تم إضافة العميل بنجاح');
        } else {
            showToast(result.error || 'فشل في إضافة العميل', 'error');
        }
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
        showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
        showLoading(false);
    }
}

function cancelNewCustomer() {
    document.getElementById('newCustomerForm').style.display = 'none';
    document.getElementById('invoiceCustomer').value = '';

    // Clear form
    document.getElementById('newCustomerName').value = '';
    document.getElementById('newCustomerICE').value = '';
    document.getElementById('newCustomerPhone').value = '';
    document.getElementById('newCustomerAddress').value = '';
}

function addInvoiceItem() {
    const container = document.getElementById('invoiceItems');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item row mb-2';
    newItem.innerHTML = `
        <div class="col-md-6">
            <select class="form-control item-product">
                <option value="">اختر المنتج...</option>
            </select>
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control item-quantity" placeholder="الكمية" min="1" value="1">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control item-price" placeholder="السعر" step="0.01" readonly>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeInvoiceItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    container.appendChild(newItem);
    populateProductSelects();
}

function removeInvoiceItem(button) {
    const item = button.closest('.invoice-item');
    item.remove();
    updateInvoiceCalculations();
}

function updateInvoiceCalculations() {
    let subtotal = 0;

    document.querySelectorAll('.invoice-item').forEach(item => {
        const productSelect = item.querySelector('.item-product');
        const quantityInput = item.querySelector('.item-quantity');
        const priceInput = item.querySelector('.item-price');

        if (productSelect.value) {
            const selectedOption = productSelect.selectedOptions[0];
            const price = parseFloat(selectedOption.dataset.price || 0);
            const quantity = parseInt(quantityInput.value || 0);

            priceInput.value = price.toFixed(2);
            subtotal += price * quantity;
        } else {
            priceInput.value = '';
        }
    });

    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;

    document.getElementById('invoiceSubtotal').textContent = `${subtotal.toFixed(2)} درهم`;
    document.getElementById('invoiceTax').textContent = `${tax.toFixed(2)} درهم`;
    document.getElementById('invoiceTotal').textContent = `${total.toFixed(2)} درهم`;
}

async function createInvoice() {
    const customerId = document.getElementById('invoiceCustomer').value;

    if (!customerId || customerId === 'new') {
        showToast('يرجى اختيار العميل', 'error');
        return;
    }

    // Collect invoice items
    const items = [];
    let hasValidItems = false;

    document.querySelectorAll('.invoice-item').forEach(item => {
        const productSelect = item.querySelector('.item-product');
        const quantityInput = item.querySelector('.item-quantity');

        if (productSelect.value && quantityInput.value) {
            const selectedOption = productSelect.selectedOptions[0];
            const product = appData.products.find(p => p.id === productSelect.value);

            if (product) {
                items.push({
                    product_id: product.id,
                    product_name: product.name,
                    quantity: parseInt(quantityInput.value),
                    price: product.price,
                    total: product.price * parseInt(quantityInput.value)
                });
                hasValidItems = true;
            }
        }
    });

    if (!hasValidItems) {
        showToast('يرجى إضافة عنصر واحد على الأقل للفاتورة', 'error');
        return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    try {
        showLoading(true);
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerId,
                items: items,
                subtotal: subtotal,
                tax: tax,
                total: total
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            appData.invoices.push(result.invoice);
            updateDashboard();
            renderInvoicesTable();

            // Close modal and reset form
            bootstrap.Modal.getInstance(document.getElementById('createInvoiceModal')).hide();
            document.getElementById('createInvoiceForm').reset();
            document.getElementById('invoiceItems').innerHTML = `
                <div class="invoice-item row mb-2">
                    <div class="col-md-6">
                        <select class="form-control item-product">
                            <option value="">اختر المنتج...</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control item-quantity" placeholder="الكمية" min="1" value="1">
                    </div>
                    <div class="col-md-2">
                        <input type="number" class="form-control item-price" placeholder="السعر" step="0.01" readonly>
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-danger btn-sm" onclick="removeInvoiceItem(this)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            updateInvoiceCalculations();

            showToast('تم إنشاء الفاتورة بنجاح');
        } else {
            showToast(result.error || 'فشل في إنشاء الفاتورة', 'error');
        }
    } catch (error) {
        console.error('خطأ في إنشاء الفاتورة:', error);
        showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
        showLoading(false);
    }
}

async function generateRandomInvoice() {
    if (appData.customers.length === 0) {
        showToast('يرجى إضافة عميل واحد على الأقل', 'error');
        return;
    }

    if (appData.products.length === 0) {
        showToast('يرجى إضافة منتج واحد على الأقل', 'error');
        return;
    }

    // Generate random invoice between 4000-5000 DH
    const targetTotal = 4000 + Math.random() * 1000;
    const targetSubtotal = targetTotal / 1.20; // Remove 20% tax

    const randomCustomer = appData.customers[Math.floor(Math.random() * appData.customers.length)];
    const randomProduct = appData.products[Math.floor(Math.random() * appData.products.length)];

    const quantity = Math.ceil(targetSubtotal / randomProduct.price);
    const subtotal = randomProduct.price * quantity;
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    const items = [{
        product_id: randomProduct.id,
        product_name: randomProduct.name,
        quantity: quantity,
        price: randomProduct.price,
        total: subtotal
    }];

    try {
        showLoading(true);
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: randomCustomer.id,
                items: items,
                subtotal: subtotal,
                tax: tax,
                total: total
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            appData.invoices.push(result.invoice);
            updateDashboard();
            renderInvoicesTable();
            showToast(`تم إنشاء فاتورة تلقائية بقيمة ${total.toFixed(2)} درهم`);
        } else {
            showToast(result.error || 'فشل في إنشاء الفاتورة التلقائية', 'error');
        }
    } catch (error) {
        console.error('خطأ في إنشاء الفاتورة التلقائية:', error);
        showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
        showLoading(false);
    }
}

// Placeholder functions
function showAddProductModal() {
    showToast('ميزة إضافة المنتجات قيد التطوير', 'error');
}
