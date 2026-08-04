const express = require('express');
const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store orders in memory
const orders = [];

// ===== ADMIN PASSWORD =====
const ADMIN_PASSWORD = 'blissful2026';

console.log('🔵 Blissful Cakes Server Starting...');

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: '✅ Server is working!' });
});

// Place an order
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

// Get all orders (API)
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// ===== ADMIN DASHBOARD WITH PASSWORD PROTECTION =====
app.get('/admin', (req, res) => {
    const password = req.query.password;
    
    if (password !== ADMIN_PASSWORD) {
        // Show login page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Login - Blissful Cakes</title>
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
                    }
                    input:focus { border-color: #e91e63; outline: none; }
                    .btn {
                        background: #e91e63;
                        color: #fff;
                        padding: 14px 36px;
                        border-radius: 50px;
                        border: none;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        font-size: 1rem;
                    }
                    .btn:hover { background: #c2185b; }
                    .error { color: #dc3545; margin-top: 12px; display: none; }
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
                        window.location.href = '/admin?password=' + encodeURIComponent(password);
                    }
                </script>
            </body>
            </html>
        `);
        return;
    }
    
    // Show admin dashboard
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blissful Cakes Admin</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; background: #fefaf5; }
            h1 { color: #2d1f14; margin-bottom: 20px; }
            .logout { float: right; color: #e91e63; text-decoration: none; font-weight: 600; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
            .stat-card { background: #fff; padding: 20px 30px; border-radius: 16px; border-left: 4px solid #e91e63; }
            .stat-card .number { font-size: 2rem; font-weight: 700; color: #e91e63; }
            .stat-card .label { color: #6b4d3a; }
            table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
            th { background: #e91e63; color: #fff; padding: 14px; text-align: left; }
            td { padding: 14px; border-bottom: 1px solid #f0e4db; }
            tr:hover { background: #fce4ec; }
            .empty { text-align: center; padding: 40px; color: #6b4d3a; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: #fef9e7; color: #f39c12; }
            .refresh-btn { background: #e91e63; color: #fff; border: none; padding: 10px 24px; border-radius: 50px; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
            .refresh-btn:hover { background: #c2185b; }
        </style>
    </head>
    <body>
        <h1>🧁 Blissful Cakes - Orders <a href="/admin" class="logout">Logout</a></h1>
        <div class="stats">
            <div class="stat-card"><div class="number">${orders.length}</div><div class="label">Total Orders</div></div>
            <div class="stat-card"><div class="number">${orders.filter(o => o.status === 'pending').length}</div><div class="label">Pending</div></div>
        </div>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        <table>
            <tr><th>#</th><th>Name</th><th>Phone</th><th>Cake</th><th>Date</th><th>Status</th></tr>`;
    
    if (orders.length === 0) {
        html += `<tr><td colspan="6" class="empty">No orders yet</td></tr>`;
    } else {
        orders.forEach((o, i) => {
            html += `<tr>
                <td>${i + 1}</td>
                <td><strong>${o.name}</strong></td>
                <td><a href="tel:${o.phone}" style="color:#e91e63;">${o.phone}</a></td>
                <td>${o.cake}</td>
                <td>${o.date}</td>
                <td><span class="badge">${o.status}</span></td>
            </tr>`;
        });
    }
    
    html += `</table>
        <p style="margin-top: 20px;"><a href="/" style="color:#e91e63;">← Back to Website</a></p>
    </body></html>`;
    res.send(html);
});

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🔐 Admin Password: ${ADMIN_PASSWORD}`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log('🎂 Blissful Cakes is ready to take orders!');
});