const express = require('express');
const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store orders in memory
const orders = [];

console.log('🔵 KK Bakery Server Starting...');

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

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// Admin dashboard
app.get('/admin', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>KK Bakery Admin</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; background: #fefaf5; }
            h1 { color: #2d1f14; margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
            .stat-card { background: #fff; padding: 20px 30px; border-radius: 16px; border-left: 4px solid #b8735c; }
            .stat-card .number { font-size: 2rem; font-weight: 700; color: #b8735c; }
            .stat-card .label { color: #6b4d3a; }
            table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
            th { background: #b8735c; color: #fff; padding: 14px; text-align: left; }
            td { padding: 14px; border-bottom: 1px solid #f0e4db; }
            tr:hover { background: #fcf3ed; }
            .empty { text-align: center; padding: 40px; color: #6b4d3a; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; background: #fef9e7; color: #f39c12; }
            .refresh-btn { background: #b8735c; color: #fff; border: none; padding: 10px 24px; border-radius: 50px; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
            .refresh-btn:hover { background: #9e5f4a; }
        </style>
    </head>
    <body>
        <h1>🧁 KK Bakery - Orders</h1>
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
                <td><a href="tel:${o.phone}" style="color:#b8735c;">${o.phone}</a></td>
                <td>${o.cake}</td>
                <td>${o.date}</td>
                <td><span class="badge">${o.status}</span></td>
            </tr>`;
        });
    }
    
    html += `</table>
        <p style="margin-top: 20px;"><a href="/" style="color:#b8735c;">← Back to Website</a></p>
    </body></html>`;
    res.send(html);
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log('🎂 KK Bakery is ready to take orders!');
});