const express = require('express');
const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store orders in memory
const orders = [];

// ===== ADMIN PASSWORD =====
// Change this to your own password!
const ADMIN_PASSWORD = 'kkbakery2026';

console.log('🔵 KK Bakery Server Starting...');

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: '✅ Server is working!' });
});

// ===== PLACE AN ORDER =====
app.post('/api/orders', (req, res) => {
    console.log('📦 Received order:', req.body);
    
    const order = {
        id: Date.now(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    console.log(`✅ Order #${order.id} saved. Total: ${orders.length} orders`);
    
    res.json({ success: true, order });
});

// ===== GET ALL ORDERS (API) =====
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// ===== ADMIN DASHBOARD WITH PASSWORD PROTECTION =====
app.get('/admin', (req, res) => {
    // Check if user has the correct password
    const password = req.query.password;
    
    if (password !== ADMIN_PASSWORD) {
        // Show login page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Login - KK Bakery</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        background: #fefaf5; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                    }
                    .login-box {
                        background: #fff;
                        padding: 50px 40px;
                        border-radius: 24px;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                        text-align: center;
                        max-width: 400px;
                        width: 100%;
                    }
                    h1 { font-family: 'Georgia', serif; color: #2d1f14; margin-bottom: 8px; }
                    p { color: #6b4d3a; margin-bottom: 24px; }
                    input {
                        width: 100%;
                        padding: 14px 16px;
                        border: 2px solid #f0e4db;
                        border-radius: 16px;
                        font-size: 1rem;
                        margin-bottom: 16px;
                        transition: border 0.3s;
                    }
                    input:focus { border-color: #b8735c; outline: none; }
                    .btn {
                        background: #b8735c;
                        color: #fff;
                        padding: 14px 36px;
                        border-radius: 50px;
                        border: none;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        font-size: 1rem;
                        transition: background 0.3s;
                    }
                    .btn:hover { background: #9e5f4a; }
                    .error { 
                        color: #dc3545; 
                        margin-top: 12px; 
                        display: none;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <div class="login-box">
                    <h1>🧁 Admin Login</h1>
                    <p>Enter the password to view orders.</p>
                    <form onsubmit="login(event)">
                        <input type="password" id="passwordInput" placeholder="Enter password" required />
                        <button type="submit" class="btn">Login</button>
                        <div class="error" id="errorMsg">❌ Incorrect password. Try again.</div>
                    </form>
                </div>
                <script>
                    function login(e) {
                        e.preventDefault();
                        const password = document.getElementById('passwordInput').value;
                        const url = '/admin?password=' + encodeURIComponent(password);
                        window.location.href = url;
                    }
                    
                    // Check if there's an error in the URL
                    if (window.location.search.includes('error=1')) {
                        document.getElementById('errorMsg').style.display = 'block';
                    }
                </script>
            </body>
            </html>
        `);
        return;
    }
    
    // ===== SHOW ADMIN DASHBOARD (Password Correct) =====
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>KK Bakery Admin</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; background: #fefaf5; }
            h1 { color: #2d1f14; margin-bottom: 20px; font-family: 'Georgia', serif; }
            .logout { float: right; color: #b8735c; text-decoration: none; font-weight: 600; font-size: 0.95rem; }
            .logout:hover { text-decoration: underline; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
            .stat-card { background: #fff; padding: 20px 30px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border-left: 4px solid #b8735c; }
            .stat-card .number { font-size: 2rem; font-weight: 700; color: #b8735c; }
            .stat-card .label { color: #6b4d3a; font-size: 0.9rem; }
            table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
            th { background: #b8735c; color: #fff; padding: 14px; text-align: left; }
            td { padding: 14px; border-bottom: 1px solid #f0e4db; }
            tr:hover { background: #fcf3ed; }
            .empty { text-align: center; padding: 40px; color: #6b4d3a; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: #fef9e7; color: #f39c12; }
            .refresh-btn { background: #b8735c; color: #fff; border: none; padding: 10px 24px; border-radius: 50px; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
            .refresh-btn:hover { background: #9e5f4a; }
            .nav-link { display: inline-block; margin-bottom: 20px; color: #b8735c; text-decoration: none; font-weight: 600; }
            .nav-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>🧁 KK Bakery - Orders <a href="/admin" class="logout">Logout</a></h1>
        <div class="stats">
            <div class="stat-card"><div class="number">${orders.length}</div><div class="label">Total Orders</div></div>
            <div class="stat-card"><div class="number">${orders.filter(o => o.status === 'pending').length}</div><div class="label">Pending</div></div>
        </div>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        <table>
            <tr><th>#</th><th>Name</th><th>Phone</th><th>Cake</th><th>Size</th><th>Date</th><th>Status</th></tr>`;
    
    if (orders.length === 0) {
        html += `<tr><td colspan="7" class="empty">No orders yet. Share the website with customers!</td></tr>`;
    } else {
        orders.forEach((o, i) => {
            html += `<tr>
                <td>${i + 1}</td>
                <td><strong>${o.name}</strong></td>
                <td><a href="tel:${o.phone}" style="color:#b8735c;">${o.phone}</a></td>
                <td>${o.cake}</td>
                <td>${o.size || '-'}</td>
                <td>${o.date}</td>
                <td><span class="badge">${o.status}</span></td>
            </tr>`;
        });
    }
    
    html += `</table>
        <p style="margin-top: 20px; color: #6b4d3a; font-size: 0.9rem;">
            📍 <a href="/" style="color:#b8735c;">Back to website</a>
        </p>
    </body></html>`;
    res.send(html);
});

// ===== HOMEPAGE =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🔐 Admin Password: ${ADMIN_PASSWORD}`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log('🎂 KK Bakery is ready to take orders!');
});