import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// COLORS - Bhab E Bengali aesthetic
const colors = {
  cream: '#F5E6D3',
  darkRed: '#8B1A1A',
  forestGreen: '#2D5016',
  gold: '#D4AF37',
  brown: '#4A2C2A',
  lightCream: '#F9F3ED',
  darkBrown: '#3A1F1F',
};

const styles = {
  container: {
    fontFamily: 'Georgia, serif',
    backgroundColor: colors.lightCream,
    minHeight: '100vh',
  },
  header: {
    backgroundColor: colors.darkRed,
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  button: (bg = colors.forestGreen, disabled = false) => ({
    backgroundColor: disabled ? '#ccc' : bg,
    color: bg === colors.gold ? colors.darkRed : 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    opacity: disabled ? 0.6 : 1,
    fontFamily: 'Georgia, serif',
  }),
  input: {
    padding: '12px',
    border: `2px solid ${colors.forestGreen}`,
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'Georgia, serif',
    width: '100%',
    marginBottom: '10px',
  },
  card: {
    backgroundColor: 'white',
    border: `2px solid ${colors.forestGreen}`,
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px',
  },
};

export default function BhabBengaliApp() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cateringRequest, setCateringRequest] = useState({
    eventName: '',
    eventDate: '',
    guestCount: '',
    items: {},
  });
  const [bulkRequest, setBulkRequest] = useState({
    organizationName: '',
    eventType: '',
    guestCount: '',
    deliveryDate: '',
    address: '',
    preferences: '',
  });

  // Fetch menu items on load
  useEffect(() => {
    fetchMenu();
    if (user) {
      fetchOrderHistory();
      if (adminMode) {
        fetchAllOrders();
        fetchReviews();
      }
    }
  }, [user, adminMode]);

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*');
    if (data) setMenuItems(data);
  };

  const fetchOrderHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setOrderHistory(data);
  };

  const fetchAllOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*');
    if (data) setReviews(data);
  };

  // AUTH
  const handleSendOTP = async () => {
    setLoading(true);
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await supabase.from('users').upsert({
      phone,
      otp_code,
      otp_expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
      otp_verified: false,
    });

    setOtpSent(true);
    console.log(`OTP: ${otp_code}`);
    alert(`Demo OTP: ${otp_code}`);
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (userData && userData.otp_code === otp) {
      await supabase
        .from('users')
        .update({ otp_verified: true })
        .eq('phone', phone);
      
      setUser(userData);
      setPage('menu');
      setOtpSent(false);
      setPhone('');
      setOtp('');
    } else {
      alert('Invalid OTP');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setAdminMode(false);
    setPage('home');
    setCart([]);
  };

  // CART
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1, customizations: {} }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity: qty } : c));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // CHECKOUT
  const handleCheckout = async () => {
    setLoading(true);
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_type: 'regular',
        total_amount: cartTotal,
        delivery_type: 'own_delivery',
        delivery_address: '',
        status: 'pending',
        payment_method: 'upi',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (!error && order) {
      // Add order items
      for (const item of cart) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        });
      }

      // Create delivery tracking
      await supabase.from('delivery_tracking').insert({
        order_id: order.id,
        current_status: 'preparing',
      });

      setSelectedOrder(order);
      setCart([]);
      setPage('order-confirmation');
    }
    setLoading(false);
  };

  // CATERING REQUEST
  const handleCateringSubmit = async () => {
    setLoading(true);
    
    const { error } = await supabase.from('catering_orders').insert({
      user_id: user.id,
      event_name: cateringRequest.eventName,
      event_date: cateringRequest.eventDate,
      guest_count: parseInt(cateringRequest.guestCount),
      items_json: cateringRequest.items,
      status: 'inquiry',
      notes: 'Custom catering request',
    });

    if (!error) {
      alert('Catering request submitted! We will contact you soon.');
      setCateringRequest({
        eventName: '',
        eventDate: '',
        guestCount: '',
        items: {},
      });
      setPage('menu');
    }
    setLoading(false);
  };

  // BULK REQUEST
  const handleBulkSubmit = async () => {
    setLoading(true);
    
    const { error } = await supabase.from('bulk_orders').insert({
      user_id: user.id,
      user_name: 'Guest',
      user_phone: user.phone,
      user_email: '',
      organization_name: bulkRequest.organizationName,
      event_type: bulkRequest.eventType,
      guest_count: parseInt(bulkRequest.guestCount),
      delivery_date: bulkRequest.deliveryDate,
      delivery_address: bulkRequest.address,
      preferences: bulkRequest.preferences,
      status: 'pending',
    });

    if (!error) {
      alert('Bulk order inquiry submitted! We will contact you within 24 hours.');
      setBulkRequest({
        organizationName: '',
        eventType: '',
        guestCount: '',
        deliveryDate: '',
        address: '',
        preferences: '',
      });
      setPage('menu');
    }
    setLoading(false);
  };

  // REVIEWS
  const handleAddReview = async (menuItemId, rating, comment) => {
    if (!selectedOrder) return;
    
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      menu_item_id: menuItemId,
      order_id: selectedOrder.id,
      rating,
      comment,
      approved: false,
    });

    if (!error) {
      alert('Review submitted! Awaiting owner approval.');
      fetchReviews();
    }
  };

  // ADMIN: Approve review
  const approveReview = async (reviewId) => {
    await supabase
      .from('reviews')
      .update({ approved: true })
      .eq('id', reviewId);
    fetchReviews();
  };

  // ADMIN: Update order status
  const updateOrderStatus = async (orderId, status) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    // Update delivery tracking
    await supabase
      .from('delivery_tracking')
      .update({ 
        current_status: status,
        status_updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    fetchAllOrders();
  };

  const categories = ['all', ...new Set(menuItems.map(m => m.category))];
  const filteredMenu = selectedCategory === 'all' ? menuItems : menuItems.filter(m => m.category === selectedCategory);

  // ========== HOME PAGE ==========
  if (page === 'home') {
    return (
      <div style={styles.container}>
        <div style={{
          backgroundImage: 'linear-gradient(135deg, #8B1A1A 0%, #2D5016 100%)',
          color: 'white',
          textAlign: 'center',
          padding: '80px 20px',
          marginBottom: '40px'
        }}>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', fontWeight: 'normal', letterSpacing: '3px' }}>
            BHAB E
          </h1>
          <h2 style={{ fontSize: '4rem', margin: '0 0 30px 0', color: colors.gold, fontWeight: 'bold' }}>
            BENGALI
          </h2>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginTop: '20px' }}>
            Authentic Bengali Cuisine
          </p>
          <p style={{ fontSize: '0.95rem', marginTop: '10px', opacity: 0.9, maxWidth: '600px', margin: '15px auto 0' }}>
            A celebration of Bengal, with love from Assam
          </p>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {[
              { icon: '🍛', title: 'Authentic Recipes', desc: 'Traditional Bengali cuisine' },
              { icon: '⏱️', title: 'Quick Delivery', desc: 'Fast preparation & delivery' },
              { icon: '🎉', title: 'Catering & Bulk', desc: 'Events & gatherings' },
              { icon: '⭐', title: 'Customer Reviews', desc: 'Trusted by our community' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{f.icon}</div>
                <h4 style={{ color: colors.darkRed, margin: '10px 0', fontSize: '1.1rem' }}>{f.title}</h4>
                <p style={{ color: colors.brown, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: colors.darkRed, color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 30px 0' }}>Order Now</h2>
          
          {!otpSent ? (
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <input
                type="tel"
                placeholder="Enter phone number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ ...styles.input, borderColor: colors.gold, marginBottom: '15px' }}
              />
              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                style={styles.button(colors.gold)}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <p style={{ fontSize: '0.85rem', marginTop: '15px', opacity: 0.8 }}>
                Demo: Use any number, OTP will be shown
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                style={{ ...styles.input, borderColor: colors.gold }}
              />
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                style={styles.button(colors.gold)}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(''); }}
                style={{ ...styles.button(colors.gold), marginTop: '10px', backgroundColor: 'transparent', borderBottom: `2px solid ${colors.gold}` }}
              >
                Try different number
              </button>
            </div>
          )}
        </div>

        <footer style={{ backgroundColor: colors.brown, color: 'white', textAlign: 'center', padding: '30px', fontSize: '0.9rem' }}>
          <p>Food • Brings • People • Together ❤️</p>
          <p>© 2024 Bhab E Bengali. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // ========== MENU PAGE ==========
  if (page === 'menu' && user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>BHAB E BENGALI</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {adminMode ? (
              <button onClick={() => setAdminMode(false)} style={styles.button(colors.forestGreen)}>
                Exit Admin
              </button>
            ) : (
              <button 
                onClick={() => setAdminMode(true)} 
                style={{ ...styles.button(colors.gold), fontSize: '0.8rem', padding: '8px 12px' }}
                title="Admin access"
              >
                👤
              </button>
            )}
            <button onClick={handleLogout} style={styles.button(colors.gold)}>
              Logout
            </button>
          </div>
        </div>

        {adminMode ? (
          // ADMIN DASHBOARD
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: colors.darkRed, marginBottom: '20px' }}>Admin Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Orders Management */}
              <div>
                <h3 style={{ color: colors.forestGreen, marginBottom: '15px' }}>Orders ({orders.length})</h3>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {orders.map(order => (
                    <div key={order.id} style={styles.card}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                        Phone: {order.user_id}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem', color: colors.gold }}>
                        ₹{order.total_amount}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                        Status: <strong>{order.status}</strong>
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ ...styles.input, marginTop: '10px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews to Approve */}
              <div>
                <h3 style={{ color: colors.forestGreen, marginBottom: '15px' }}>
                  Reviews to Approve ({reviews.filter(r => !r.approved).length})
                </h3>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {reviews.filter(r => !r.approved).map(review => (
                    <div key={review.id} style={styles.card}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                        {'⭐'.repeat(review.rating)}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                        {review.comment}
                      </p>
                      <button
                        onClick={() => approveReview(review.id)}
                        style={{ ...styles.button(colors.forestGreen), fontSize: '0.85rem', padding: '8px 12px', marginTop: '10px' }}
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                  {reviews.filter(r => r.approved).length > 0 && (
                    <p style={{ color: colors.brown, marginTop: '20px', fontStyle: 'italic' }}>
                      Approved: {reviews.filter(r => r.approved).length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // CUSTOMER MENU
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <p style={{ textAlign: 'center', color: colors.brown, marginBottom: '20px' }}>
              Welcome, {user.phone}
            </p>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
              <button onClick={() => setPage('menu')} style={styles.button(colors.forestGreen)}>
                🍛 Browse Menu
              </button>
              <button onClick={() => setPage('order-history')} style={styles.button(colors.forestGreen)}>
                📋 My Orders
              </button>
              <button onClick={() => setPage('catering')} style={styles.button(colors.forestGreen)}>
                🎉 Catering
              </button>
              <button onClick={() => setPage('bulk')} style={styles.button(colors.forestGreen)}>
                👥 Bulk Orders
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '30px', textAlign: 'center', overflowX: 'auto', paddingBottom: '10px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    margin: '5px',
                    padding: '8px 15px',
                    backgroundColor: selectedCategory === cat ? colors.darkRed : colors.cream,
                    color: selectedCategory === cat ? 'white' : colors.darkRed,
                    border: `2px solid ${colors.darkRed}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    fontFamily: 'Georgia, serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {filteredMenu.map(item => (
                <div key={item.id} style={styles.card}>
                  <h3 style={{ color: colors.darkRed, margin: '0 0 8px 0', fontSize: '1.05rem' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: colors.brown, margin: '5px 0', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div>
                      <p style={{ margin: 0, color: colors.gold, fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ₹{item.price}
                      </p>
                      <p style={{ margin: '3px 0 0 0', color: colors.brown, fontSize: '0.8rem' }}>
                        ⏱️ {item.prep_time_mins} min
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      style={styles.button(item.available ? colors.forestGreen : '#999', !item.available)}
                    >
                      {item.available ? 'Add' : 'Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div style={{ ...styles.card, borderTop: `4px solid ${colors.darkRed}`, backgroundColor: 'white' }}>
                <h2 style={{ color: colors.darkRed, margin: '0 0 15px 0' }}>Your Order</h2>
                <div style={{ marginBottom: '15px' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: colors.brown }}>{item.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ ...styles.button(colors.forestGreen), padding: '4px 8px', fontSize: '0.8rem' }}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ ...styles.button(colors.forestGreen), padding: '4px 8px', fontSize: '0.8rem' }}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: colors.gold }}>₹{item.price * item.quantity}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ ...styles.button(colors.darkRed), padding: '4px 8px', fontSize: '0.8rem', marginTop: '5px' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '15px 0', borderTop: `2px solid ${colors.forestGreen}` }}>
                  <p style={{ fontSize: '1.1rem', margin: '10px 0', color: colors.darkRed, fontWeight: 'bold' }}>
                    Total: ₹{cartTotal}
                  </p>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    style={{ ...styles.button(colors.darkRed), width: '100%' }}
                  >
                    {loading ? 'Processing...' : '✓ Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ========== ORDER CONFIRMATION ==========
  if (page === 'order-confirmation' && selectedOrder) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0 }}>BHAB E BENGALI</h1>
          <button onClick={handleLogout} style={styles.button(colors.gold)}>Logout</button>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: colors.darkRed, fontSize: '1.8rem', margin: '0 0 10px 0' }}>Order Confirmed!</h2>
            <p style={{ color: colors.brown, margin: 0 }}>Your delicious food is being prepared</p>
          </div>

          <div style={styles.card}>
            <p><strong>Order ID:</strong> #{selectedOrder.id.slice(0, 8)}</p>
            <p><strong>Amount:</strong> ₹{selectedOrder.total_amount}</p>
            <p><strong>Status:</strong> <span style={{ color: colors.gold, fontWeight: 'bold' }}>Preparing</span></p>
            <p><strong>Estimated Time:</strong> 30-45 minutes</p>
          </div>

          <div style={{ ...styles.card, backgroundColor: '#f0f8f0' }}>
            <h3 style={{ color: colors.forestGreen, margin: '0 0 10px 0' }}>Real-time Tracking</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
              {['Preparing', 'Packed', 'Out for Delivery', 'Delivered'].map((status, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? colors.gold : '#ddd',
                    margin: '0 auto 5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>{status}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ color: colors.brown, marginBottom: '15px' }}>
              🔔 You'll receive SMS updates at each step
            </p>
            <button
              onClick={() => { setPage('menu'); setSelectedOrder(null); }}
              style={styles.button(colors.forestGreen, false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== ORDER HISTORY ==========
  if (page === 'order-history' && user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0 }}>BHAB E BENGALI</h1>
          <button onClick={() => setPage('menu')} style={styles.button(colors.gold)}>Back</button>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <h2 style={{ color: colors.darkRed, marginBottom: '20px' }}>Your Order History</h2>
          
          {orderHistory.length === 0 ? (
            <p style={{ color: colors.brown, textAlign: 'center' }}>No orders yet. Start by browsing our menu!</p>
          ) : (
            <div>
              {orderHistory.map(order => (
                <div key={order.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Order #{order.id.slice(0, 8)}</p>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: colors.brown }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: colors.gold }}>₹{order.total_amount}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: order.status === 'delivered' ? colors.forestGreen : colors.gold,
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}>
                        {order.status}
                      </span>
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setPage('menu');
                          }}
                          style={{ ...styles.button(colors.forestGreen), fontSize: '0.85rem', padding: '6px 12px', marginTop: '10px', display: 'block', width: '100%' }}
                        >
                          Review Items
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== CATERING PAGE ==========
  if (page === 'catering' && user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0 }}>CATERING REQUEST</h1>
          <button onClick={() => setPage('menu')} style={styles.button(colors.gold)}>Back</button>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={styles.card}>
            <h2 style={{ color: colors.darkRed, marginBottom: '20px' }}>Plan Your Event</h2>
            <input
              type="text"
              placeholder="Event name"
              value={cateringRequest.eventName}
              onChange={(e) => setCateringRequest({ ...cateringRequest, eventName: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              value={cateringRequest.eventDate}
              onChange={(e) => setCateringRequest({ ...cateringRequest, eventDate: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Number of guests"
              min="10"
              max="500"
              value={cateringRequest.guestCount}
              onChange={(e) => setCateringRequest({ ...cateringRequest, guestCount: e.target.value })}
              style={styles.input}
            />
            
            <p style={{ color: colors.brown, marginBottom: '10px' }}>Select dishes:</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {menuItems.map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const items = { ...cateringRequest.items };
                      if (e.target.checked) {
                        items[item.id] = 1;
                      } else {
                        delete items[item.id];
                      }
                      setCateringRequest({ ...cateringRequest, items });
                    }}
                    style={{ marginRight: '10px' }}
                  />
                  <span>{item.name} - ₹{item.price}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleCateringSubmit}
              disabled={loading || !cateringRequest.eventName || !cateringRequest.eventDate}
              style={{ ...styles.button(colors.darkRed), width: '100%' }}
            >
              {loading ? 'Submitting...' : 'Submit Catering Request'}
            </button>
            <p style={{ fontSize: '0.85rem', color: colors.brown, marginTop: '15px', textAlign: 'center' }}>
              We'll contact you with a customized quote
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== BULK PAGE ==========
  if (page === 'bulk' && user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ margin: 0 }}>BULK ORDERS</h1>
          <button onClick={() => setPage('menu')} style={styles.button(colors.gold)}>Back</button>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={styles.card}>
            <h2 style={{ color: colors.darkRed, marginBottom: '20px' }}>Bulk Order Inquiry</h2>
            <p style={{ color: colors.brown, marginBottom: '20px', fontSize: '0.95rem' }}>
              For orders of 50-100 people. Delivery date must be at least 1 week away.
            </p>

            <input
              type="text"
              placeholder="Organization name"
              value={bulkRequest.organizationName}
              onChange={(e) => setBulkRequest({ ...bulkRequest, organizationName: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Event type (Wedding, Conference, etc.)"
              value={bulkRequest.eventType}
              onChange={(e) => setBulkRequest({ ...bulkRequest, eventType: e.target.value })}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Number of people (50-100)"
              min="50"
              max="100"
              value={bulkRequest.guestCount}
              onChange={(e) => setBulkRequest({ ...bulkRequest, guestCount: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              value={bulkRequest.deliveryDate}
              onChange={(e) => setBulkRequest({ ...bulkRequest, deliveryDate: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Delivery address"
              value={bulkRequest.address}
              onChange={(e) => setBulkRequest({ ...bulkRequest, address: e.target.value })}
              style={styles.input}
            />
            <textarea
              placeholder="Any preferences or dietary requirements"
              value={bulkRequest.preferences}
              onChange={(e) => setBulkRequest({ ...bulkRequest, preferences: e.target.value })}
              style={{ ...styles.input, minHeight: '100px', fontFamily: 'Georgia, serif' }}
            />

            <button
              onClick={handleBulkSubmit}
              disabled={loading || !bulkRequest.organizationName || !bulkRequest.guestCount}
              style={{ ...styles.button(colors.darkRed), width: '100%' }}
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
            <p style={{ fontSize: '0.85rem', color: colors.brown, marginTop: '15px', textAlign: 'center' }}>
              We'll contact you within 24 hours with a detailed quote
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
