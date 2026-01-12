// Global state
let currentUser = null;
let currentOrganization = null;
let organizations = [];
let branches = [];
let products = [];
let invoices = [];
let branchTypes = [];

const API_BASE = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        } else {
            initDashboard();
        }
    } else {
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        } else {
            initLogin();
        }
    }
});

// ==================== LOGIN/REGISTER ====================

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('regUsername').value,
                email: document.getElementById('regEmail').value,
                full_name: document.getElementById('regFullName').value,
                password: document.getElementById('regPassword').value
            };
            
            try {
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Registration successful! Please login.');
                    document.getElementById('showLogin').click();
                } else {
                    alert(data.message || 'Registration failed');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        });
    }
}

// ==================== DASHBOARD ====================

function initDashboard() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Logout
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
    
    // Load initial data
    loadOrganizations();
    loadDashboard();
    
    // Modal handlers
    setupModals();
    
    // Form handlers
    setupForms();
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    
    const page = document.getElementById(`${pageName}-page`);
    const link = document.querySelector(`[data-page="${pageName}"]`);
    
    if (page) page.classList.add('active');
    if (link) link.classList.add('active');
    
    // Load data for specific pages
    if (pageName === 'branches') loadBranches();
    if (pageName === 'products') loadProducts();
    if (pageName === 'invoices') loadInvoices();
    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'branch-types') loadBranchTypesPage();
}

// ==================== ORGANIZATIONS ====================

async function loadOrganizations() {
    try {
        const response = await fetch(`${API_BASE}/organizations/${currentUser.id}`);
        const data = await response.json();
        if (data.success) {
            organizations = data.organizations;
            renderOrganizations();
            updateOrgFilters();
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

function renderOrganizations() {
    const tbody = document.querySelector('#organizationsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = organizations.map(org => `
        <tr>
            <td>${org.name}</td>
            <td>${org.email || '-'}</td>
            <td>${org.phone || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editOrganization(${org.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function updateOrgFilters() {
    const orgFilter = document.getElementById('orgFilter');
    const branchOrgId = document.getElementById('branchOrgId');
    const branchTypeOrgFilter = document.getElementById('branchTypeOrgFilter');
    const branchTypeOrgId = document.getElementById('branchTypeOrgId');
    
    const options = organizations.map(org => `<option value="${org.id}">${org.name}</option>`).join('');
    
    if (orgFilter) {
        orgFilter.innerHTML = '<option value="">All Organizations</option>' + options;
    }
    
    if (branchOrgId) {
        branchOrgId.innerHTML = '<option value="">Select Organization</option>' + options;
    }
    
    if (branchTypeOrgFilter) {
        branchTypeOrgFilter.innerHTML = '<option value="">Select Organization</option>' + options;
    }
    
    if (branchTypeOrgId) {
        branchTypeOrgId.innerHTML = '<option value="">Select Organization</option>' + options;
    }
}

// ==================== BRANCHES ====================

async function loadBranches() {
    try {
        const orgId = document.getElementById('orgFilter')?.value || '';
        const url = orgId 
            ? `${API_BASE}/branches/${orgId}`
            : organizations.length > 0 ? `${API_BASE}/branches/${organizations[0].id}` : '';
        
        if (!url) return;
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
            branches = data.branches;
            renderBranches();
            updateBranchFilters();
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

function renderBranches() {
    const tbody = document.querySelector('#branchesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = branches.map(branch => `
        <tr>
            <td>${branch.name}</td>
            <td>${organizations.find(o => o.id === branch.organization_id)?.name || '-'}</td>
            <td>${branch.branch_type_name || '-'}</td>
            <td>${branch.phone || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editBranch(${branch.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function updateBranchFilters() {
    const branchFilter = document.getElementById('branchFilter');
    const invoiceBranchFilter = document.getElementById('invoiceBranchFilter');
    const productBranchId = document.getElementById('productBranchId');
    const invoiceBranchId = document.getElementById('invoiceBranchId');
    
    const options = branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    
    if (branchFilter) branchFilter.innerHTML = '<option value="">Select Branch</option>' + options;
    if (invoiceBranchFilter) invoiceBranchFilter.innerHTML = '<option value="">Select Branch</option>' + options;
    if (productBranchId) productBranchId.innerHTML = '<option value="">Select Branch</option>' + options;
    if (invoiceBranchId) invoiceBranchId.innerHTML = '<option value="">Select Branch</option>' + options;
}

// ==================== PRODUCTS ====================

async function loadProducts() {
    const branchId = document.getElementById('branchFilter')?.value;
    if (!branchId) return;
    
    try {
        const response = await fetch(`${API_BASE}/products/${branchId}`);
        const data = await response.json();
        if (data.success) {
            products = data.products;
            renderProducts();
            updateProductFilters();
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts() {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>${parseFloat(product.tax_rate).toFixed(2)}%</td>
            <td>${product.stock_quantity}</td>
            <td>${product.unit}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateProductFilters() {
    const invoiceItems = document.querySelectorAll('.item-product');
    invoiceItems.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Product</option>' +
            products.map(p => `<option value="${p.id}" data-price="${p.price}" data-tax="${p.tax_rate}" data-name="${p.name}">${p.name} - $${parseFloat(p.price).toFixed(2)}</option>`).join('');
        select.value = currentValue;
    });
}

// ==================== INVOICES ====================

async function loadInvoices() {
    const branchId = document.getElementById('invoiceBranchFilter')?.value;
    if (!branchId) return;
    
    try {
        const response = await fetch(`${API_BASE}/invoices/${branchId}`);
        const data = await response.json();
        if (data.success) {
            invoices = data.invoices;
            renderInvoices();
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

function renderInvoices() {
    const tbody = document.querySelector('#invoicesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td>${invoice.invoice_number}</td>
            <td>${branches.find(b => b.id === invoice.branch_id)?.name || '-'}</td>
            <td>${invoice.customer_name}</td>
            <td>$${parseFloat(invoice.total_amount).toFixed(2)}</td>
            <td>${new Date(invoice.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewInvoice(${invoice.id})">View</button>
            </td>
        </tr>
    `).join('');
}

// ==================== DASHBOARD STATS ====================

async function loadDashboard() {
    if (organizations.length === 0) {
        await loadOrganizations();
    }
    
    if (organizations.length === 0) return;
    
    const orgId = organizations[0].id;
    
    try {
        const response = await fetch(`${API_BASE}/dashboard/${orgId}`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('statBranches').textContent = data.stats.totalBranches;
            document.getElementById('statProducts').textContent = data.stats.totalProducts;
            document.getElementById('statInvoices').textContent = data.stats.totalInvoices;
            document.getElementById('statSales').textContent = `$${parseFloat(data.stats.totalSales).toFixed(2)}`;
            
            // Sales by branch
            const salesContainer = document.getElementById('salesByBranch');
            if (salesContainer) {
                salesContainer.innerHTML = data.salesByBranch.map(item => `
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>${item.name}</span>
                            <span>$${parseFloat(item.total).toFixed(2)}</span>
                        </div>
                        <div style="background: #eee; height: 20px; border-radius: 10px; overflow: hidden;">
                            <div style="background: #667eea; height: 100%; width: ${Math.min(100, (parseFloat(item.total) / Math.max(...data.salesByBranch.map(s => parseFloat(s.total)), 1)) * 100)}%"></div>
                        </div>
                    </div>
                `).join('');
            }
            
            // Recent invoices
            const invoicesTbody = document.querySelector('#recentInvoicesTable tbody');
            if (invoicesTbody) {
                invoicesTbody.innerHTML = data.recentInvoices.map(inv => `
                    <tr>
                        <td>${inv.invoice_number}</td>
                        <td>${inv.branch_name}</td>
                        <td>${inv.customer_name}</td>
                        <td>$${parseFloat(inv.total_amount).toFixed(2)}</td>
                        <td>${new Date(inv.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="viewInvoice(${inv.id})">View</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==================== MODALS ====================

function setupModals() {
    // Close modals
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });
    
    // Open modals
    document.getElementById('addOrgBtn')?.addEventListener('click', () => openOrgModal());
    document.getElementById('addBranchTypeBtn')?.addEventListener('click', () => openBranchTypeModal());
    document.getElementById('addBranchBtn')?.addEventListener('click', () => openBranchModal());
    document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());
    document.getElementById('createInvoiceBtn')?.addEventListener('click', () => openInvoiceModal());
    document.getElementById('printInvoiceBtn')?.addEventListener('click', () => window.print());
    
    // Filter changes
    document.getElementById('orgFilter')?.addEventListener('change', loadBranches);
    document.getElementById('branchFilter')?.addEventListener('change', loadProducts);
    document.getElementById('invoiceBranchFilter')?.addEventListener('change', loadInvoices);
    document.getElementById('branchTypeOrgFilter')?.addEventListener('change', loadBranchTypesPage);
}

function openOrgModal(orgId = null) {
    const modal = document.getElementById('orgModal');
    const form = document.getElementById('orgForm');
    const title = document.getElementById('orgModalTitle');
    
    if (orgId) {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            document.getElementById('orgId').value = org.id;
            document.getElementById('orgName').value = org.name;
            document.getElementById('orgAddress').value = org.address || '';
            document.getElementById('orgPhone').value = org.phone || '';
            document.getElementById('orgEmail').value = org.email || '';
            document.getElementById('orgTaxId').value = org.tax_id || '';
            title.textContent = 'Edit Organization';
        }
    } else {
        form.reset();
        document.getElementById('orgId').value = '';
        title.textContent = 'Add Organization';
    }
    
    modal.classList.add('active');
}

async function loadBranchTypes(organizationId) {
    try {
        const response = await fetch(`${API_BASE}/branch-types/${organizationId}`);
        const data = await response.json();
        if (data.success) {
            branchTypes = data.branchTypes;
            updateBranchTypeSelect(organizationId);
        }
    } catch (error) {
        console.error('Error loading branch types:', error);
    }
}

function updateBranchTypeSelect(organizationId) {
    const select = document.getElementById('branchTypeId');
    if (select) {
        const filteredTypes = branchTypes.filter(bt => bt.organization_id == organizationId);
        select.innerHTML = '<option value="">None</option>' +
            filteredTypes.map(bt => `<option value="${bt.id}">${bt.name}</option>`).join('');
    }
}

async function openBranchModal(branchId = null) {
    const modal = document.getElementById('branchModal');
    const form = document.getElementById('branchForm');
    const title = document.getElementById('branchModalTitle');
    
    // Load branch types when organization is selected
    const orgSelect = document.getElementById('branchOrgId');
    orgSelect.addEventListener('change', async (e) => {
        if (e.target.value) {
            await loadBranchTypes(e.target.value);
        }
    });
    
    if (branchId) {
        const branch = branches.find(b => b.id === branchId);
        if (branch) {
            document.getElementById('branchId').value = branch.id;
            document.getElementById('branchOrgId').value = branch.organization_id;
            await loadBranchTypes(branch.organization_id);
            document.getElementById('branchTypeId').value = branch.branch_type_id || '';
            document.getElementById('branchName').value = branch.name;
            document.getElementById('branchAddress').value = branch.address || '';
            document.getElementById('branchPhone').value = branch.phone || '';
            document.getElementById('branchEmail').value = branch.email || '';
            document.getElementById('branchBillColor').value = branch.bill_color || '#000000';
            document.getElementById('branchBillFont').value = branch.bill_font || 'Arial';
            document.getElementById('branchBillIcon').value = branch.bill_icon || '';
            title.textContent = 'Edit Branch';
        }
    } else {
        form.reset();
        document.getElementById('branchId').value = '';
        document.getElementById('branchBillColor').value = '#000000';
        document.getElementById('branchBillFont').value = 'Arial';
        title.textContent = 'Add Branch';
    }
    
    modal.classList.add('active');
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productBranchId').value = product.branch_id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productTaxRate').value = product.tax_rate;
            document.getElementById('productStock').value = product.stock_quantity;
            document.getElementById('productUnit').value = product.unit;
            title.textContent = 'Edit Product';
        }
    } else {
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productTaxRate').value = '0';
        document.getElementById('productStock').value = '0';
        document.getElementById('productUnit').value = 'pcs';
        title.textContent = 'Add Product';
    }
    
    modal.classList.add('active');
}

function openInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    const form = document.getElementById('invoiceForm');
    
    form.reset();
    document.getElementById('invoiceNumber').value = 'INV-' + Date.now();
    document.getElementById('invoiceDiscount').value = '0';
    
    // Reset items
    const itemsContainer = document.getElementById('invoiceItems');
    itemsContainer.innerHTML = `
        <div class="invoice-item">
            <select class="item-product" required>
                <option value="">Select Product</option>
            </select>
            <input type="number" class="item-quantity" placeholder="Qty" min="1" value="1" required>
            <button type="button" class="btn btn-danger btn-sm remove-item">Remove</button>
        </div>
    `;
    
    updateProductFilters();
    setupInvoiceItemHandlers();
    modal.classList.add('active');
}

// ==================== FORMS ====================

function setupForms() {
    // Organization form
    document.getElementById('orgForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orgId = document.getElementById('orgId').value;
        const formData = {
            user_id: currentUser.id,
            name: document.getElementById('orgName').value,
            address: document.getElementById('orgAddress').value,
            phone: document.getElementById('orgPhone').value,
            email: document.getElementById('orgEmail').value,
            tax_id: document.getElementById('orgTaxId').value
        };
        
        try {
            const url = orgId 
                ? `${API_BASE}/organizations/${orgId}`
                : `${API_BASE}/organizations`;
            const method = orgId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                document.getElementById('orgModal').classList.remove('active');
                loadOrganizations();
            } else {
                alert(data.message || 'Error saving organization');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    // Branch form
    document.getElementById('branchForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const branchId = document.getElementById('branchId').value;
        const formData = {
            organization_id: document.getElementById('branchOrgId').value,
            branch_type_id: document.getElementById('branchTypeId').value || null,
            name: document.getElementById('branchName').value,
            address: document.getElementById('branchAddress').value,
            phone: document.getElementById('branchPhone').value,
            email: document.getElementById('branchEmail').value,
            bill_color: document.getElementById('branchBillColor').value,
            bill_font: document.getElementById('branchBillFont').value,
            bill_icon: document.getElementById('branchBillIcon').value
        };
        
        try {
            const url = branchId 
                ? `${API_BASE}/branches/${branchId}`
                : `${API_BASE}/branches`;
            const method = branchId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                document.getElementById('branchModal').classList.remove('active');
                loadBranches();
            } else {
                alert(data.message || 'Error saving branch');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    // Product form
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('productId').value;
        const formData = {
            branch_id: document.getElementById('productBranchId').value,
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            tax_rate: parseFloat(document.getElementById('productTaxRate').value) || 0,
            stock_quantity: parseInt(document.getElementById('productStock').value) || 0,
            unit: document.getElementById('productUnit').value
        };
        
        try {
            const url = productId 
                ? `${API_BASE}/products/${productId}`
                : `${API_BASE}/products`;
            const method = productId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                document.getElementById('productModal').classList.remove('active');
                loadProducts();
            } else {
                alert(data.message || 'Error saving product');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    // Invoice form
    document.getElementById('invoiceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const branchId = document.getElementById('invoiceBranchId').value;
        const branch = branches.find(b => b.id == branchId);
        
        const items = [];
        let subtotal = 0;
        let totalTax = 0;
        
        document.querySelectorAll('.invoice-item').forEach(itemEl => {
            const productSelect = itemEl.querySelector('.item-product');
            const quantity = parseFloat(itemEl.querySelector('.item-quantity').value);
            
            if (productSelect.value) {
                const product = products.find(p => p.id == productSelect.value);
                if (product) {
                    const unitPrice = parseFloat(product.price);
                    const taxRate = parseFloat(product.tax_rate) || 0;
                    const itemTotal = unitPrice * quantity;
                    const itemTax = itemTotal * (taxRate / 100);
                    
                    items.push({
                        product_id: product.id,
                        product_name: product.name,
                        quantity: quantity,
                        unit_price: unitPrice,
                        tax_rate: taxRate,
                        total: itemTotal
                    });
                    
                    subtotal += itemTotal;
                    totalTax += itemTax;
                }
            }
        });
        
        const discount = parseFloat(document.getElementById('invoiceDiscount').value) || 0;
        const totalAmount = subtotal + totalTax - discount;
        
        const formData = {
            branch_id: branchId,
            invoice_number: document.getElementById('invoiceNumber').value,
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            customer_phone: document.getElementById('customerPhone').value,
            customer_address: document.getElementById('customerAddress').value,
            items: items,
            subtotal: subtotal,
            tax_amount: totalTax,
            discount: discount,
            total_amount: totalAmount,
            notes: document.getElementById('invoiceNotes').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                document.getElementById('invoiceModal').classList.remove('active');
                loadInvoices();
                loadDashboard();
                alert('Invoice created successfully!');
            } else {
                alert(data.message || 'Error creating invoice');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
    
    // Invoice item handlers
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        const itemsContainer = document.getElementById('invoiceItems');
        const newItem = document.createElement('div');
        newItem.className = 'invoice-item';
        newItem.innerHTML = `
            <select class="item-product" required>
                <option value="">Select Product</option>
            </select>
            <input type="number" class="item-quantity" placeholder="Qty" min="1" value="1" required>
            <button type="button" class="btn btn-danger btn-sm remove-item">Remove</button>
        `;
        itemsContainer.appendChild(newItem);
        updateProductFilters();
        setupInvoiceItemHandlers();
    });
}

function setupInvoiceItemHandlers() {
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.invoice-item').remove();
            calculateInvoiceTotal();
        });
    });
    
    document.querySelectorAll('.item-product').forEach(select => {
        select.addEventListener('change', calculateInvoiceTotal);
    });
    
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('input', calculateInvoiceTotal);
    });
    
    document.getElementById('invoiceDiscount')?.addEventListener('input', calculateInvoiceTotal);
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    let totalTax = 0;
    
    document.querySelectorAll('.invoice-item').forEach(itemEl => {
        const productSelect = itemEl.querySelector('.item-product');
        const quantity = parseFloat(itemEl.querySelector('.item-quantity').value) || 0;
        
        if (productSelect.value) {
            const option = productSelect.options[productSelect.selectedIndex];
            const price = parseFloat(option.getAttribute('data-price')) || 0;
            const taxRate = parseFloat(option.getAttribute('data-tax')) || 0;
            const itemTotal = price * quantity;
            const itemTax = itemTotal * (taxRate / 100);
            
            subtotal += itemTotal;
            totalTax += itemTax;
        }
    });
    
    const discount = parseFloat(document.getElementById('invoiceDiscount')?.value) || 0;
    const total = subtotal + totalTax - discount;
    
    document.getElementById('invoiceSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('invoiceTax').textContent = `$${totalTax.toFixed(2)}`;
    document.getElementById('invoiceDiscountDisplay').textContent = `$${discount.toFixed(2)}`;
    document.getElementById('invoiceTotal').textContent = `$${total.toFixed(2)}`;
}

// ==================== EDIT FUNCTIONS ====================

window.editOrganization = function(id) {
    openOrgModal(id);
};

window.editBranch = function(id) {
    openBranchModal(id);
};

window.editProduct = function(id) {
    openProductModal(id);
};

window.deleteProduct = async function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
            loadProducts();
        } else {
            alert(data.message || 'Error deleting product');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// ==================== BRANCH TYPES ====================

async function loadBranchTypesPage() {
    const orgId = document.getElementById('branchTypeOrgFilter')?.value;
    if (!orgId) return;
    
    await loadBranchTypes(orgId);
    renderBranchTypes();
}

function renderBranchTypes() {
    const tbody = document.querySelector('#branchTypesTable tbody');
    if (!tbody) return;
    
    const orgId = document.getElementById('branchTypeOrgFilter')?.value;
    const filteredTypes = orgId ? branchTypes.filter(bt => bt.organization_id == orgId) : branchTypes;
    
    tbody.innerHTML = filteredTypes.map(bt => `
        <tr>
            <td>${bt.name}</td>
            <td>${organizations.find(o => o.id === bt.organization_id)?.name || '-'}</td>
            <td>${bt.description || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editBranchType(${bt.id})">Edit</button>
            </td>
        </tr>
    `).join('');
}

function openBranchTypeModal(branchTypeId = null) {
    const modal = document.getElementById('branchTypeModal');
    const form = document.getElementById('branchTypeForm');
    const title = document.getElementById('branchTypeModalTitle');
    
    if (branchTypeId) {
        const branchType = branchTypes.find(bt => bt.id === branchTypeId);
        if (branchType) {
            document.getElementById('branchTypeId').value = branchType.id;
            document.getElementById('branchTypeOrgId').value = branchType.organization_id;
            document.getElementById('branchTypeName').value = branchType.name;
            document.getElementById('branchTypeDescription').value = branchType.description || '';
            title.textContent = 'Edit Branch Type';
        }
    } else {
        form.reset();
        document.getElementById('branchTypeId').value = '';
        title.textContent = 'Add Branch Type';
    }
    
    modal.classList.add('active');
}

window.editBranchType = function(id) {
    openBranchTypeModal(id);
};

// Branch Type form handler
document.getElementById('branchTypeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const branchTypeId = document.getElementById('branchTypeId').value;
    const formData = {
        organization_id: document.getElementById('branchTypeOrgId').value,
        name: document.getElementById('branchTypeName').value,
        description: document.getElementById('branchTypeDescription').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/branch-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (data.success) {
            document.getElementById('branchTypeModal').classList.remove('active');
            loadBranchTypesPage();
        } else {
            alert(data.message || 'Error saving branch type');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// ==================== INVOICE VIEW ====================

window.viewInvoice = async function(invoiceId) {
    try {
        const response = await fetch(`${API_BASE}/invoice/${invoiceId}`);
        const data = await response.json();
        
        if (data.success) {
            const invoice = data.invoice;
            const items = data.items;
            const branch = branches.find(b => b.id == invoice.branch_id);
            const org = organizations.find(o => o.id == branch?.organization_id);
            
            const preview = document.getElementById('invoicePreview');
            preview.innerHTML = `
                <div class="invoice-preview" style="color: ${branch?.bill_color || '#000'}; font-family: ${branch?.bill_font || 'Arial'};">
                    <div class="invoice-preview-header">
                        <div>
                            ${branch?.bill_icon ? `<img src="${branch.bill_icon}" alt="Logo">` : ''}
                            <h1>${org?.name || 'Organization'}</h1>
                            <p>${branch?.name || 'Branch'}</p>
                            <p>${branch?.address || ''}</p>
                            <p>${branch?.phone || ''}</p>
                        </div>
                        <div>
                            <h2>INVOICE</h2>
                            <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
                            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <div>
                            <h3>Bill To:</h3>
                            <p><strong>${invoice.customer_name}</strong></p>
                            <p>${invoice.customer_email || ''}</p>
                            <p>${invoice.customer_phone || ''}</p>
                            <p>${invoice.customer_address || ''}</p>
                        </div>
                    </div>
                    
                    <table class="invoice-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Tax</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.product_name}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td>${parseFloat(item.tax_rate).toFixed(2)}%</td>
                                    <td>$${parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="invoice-total">
                        <table>
                            <tr>
                                <td>Subtotal:</td>
                                <td>$${parseFloat(invoice.subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Tax:</td>
                                <td>$${parseFloat(invoice.tax_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Discount:</td>
                                <td>$${parseFloat(invoice.discount).toFixed(2)}</td>
                            </tr>
                            <tr class="total-row">
                                <td>Total:</td>
                                <td>$${parseFloat(invoice.total_amount).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    ${invoice.notes ? `<p style="margin-top: 20px;"><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
                </div>
            `;
            
            document.getElementById('invoiceViewModal').classList.add('active');
        }
    } catch (error) {
        alert('Error loading invoice: ' + error.message);
    }
};
