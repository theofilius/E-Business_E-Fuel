const API_URL = 'http://localhost:5001/api';

async function testFlow() {
  try {
    console.log('--- 1. Customer Login ---');
    let res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@efuel.com', password: 'demo123' })
    });
    let body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    const customerToken = body.data.token;
    console.log('Customer login success. Token:', customerToken ? 'OK' : 'FAIL');

    console.log('--- 2. Create Order ---');
    res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        fuelType: 'IGNITE',
        liters: 10,
        totalPrice: 125000,
        location: {
          address: 'Test Address',
          coordinates: { lat: -6.2, lng: 106.8 }
        },
        paymentMethod: 'cash',
        vehicle: {
          type: 'Motor',
          plateNumber: 'B 1234 TEST'
        }
      })
    });
    body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    const orderId = body.data._id;
    console.log('Order created. ID:', orderId);

    console.log('--- 3. Driver Login ---');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver1@efuel.com', password: 'driver123' })
    });
    body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    const driverToken = body.data.token;
    console.log('Driver login success. Token:', driverToken ? 'OK' : 'FAIL');

    console.log('--- 4. Driver Accept Order ---');
    res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${driverToken}`
      }
    });
    body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    console.log('Order accepted. Status:', body.data.status);

    console.log('--- 5. Admin Login & Stats ---');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@efuel.com', password: 'admin123' })
    });
    body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    const adminToken = body.data.token;
    console.log('Admin login success. Token:', adminToken ? 'OK' : 'FAIL');

    res = await fetch(`${API_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    body = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(body));
    console.log('Admin Stats:', body.data);

    console.log('✅ Flow End-to-End Success!');
  } catch (error) {
    console.error('❌ Flow Failed:', error.message);
  }
}

testFlow();
