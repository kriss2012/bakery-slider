import express from 'express';
import cors from 'cors';
import { getDb } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory cart store: { [cartId]: [ { id, productId, quantity, toppings, name, price, src } ] }
const carts = {};

// Helper to generate UUID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to generate a unique order ID: ORDER-XXXXX
async function generateUniqueOrderId(db) {
  let isUnique = false;
  let orderId = '';
  while (!isUnique) {
    const num = Math.floor(10000 + Math.random() * 90000);
    orderId = `ORDER-${num}`;
    const existing = await db.get('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (!existing) {
      isUnique = true;
    }
  }
  return orderId;
}

// Ensure DB is initialized
let db;
async function initDb() {
  db = await getDb();
}
initDb().catch(err => {
  console.error("Failed to initialize database:", err);
});

// 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    const parsedProducts = products.map(p => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : [],
      ingredients: p.ingredients ? JSON.parse(p.ingredients) : [],
      nutrition: p.nutrition ? JSON.parse(p.nutrition) : []
    }));
    res.json(parsedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// 2. ADD A NEW PRODUCT (Admin Panel)
app.post('/api/products', async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      stock,
      description,
      src,
      alt,
      bg,
      themeColor,
      accentColor,
      textColor,
      specs,
      ingredients,
      nutrition,
      bgText
    } = req.body;

    if (!title || !category || price === undefined || stock === undefined || !src) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique slug-like ID
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let productId = slug;
    let counter = 1;
    let existing = await db.get('SELECT id FROM products WHERE id = ?', [productId]);
    while (existing) {
      productId = `${slug}-${counter}`;
      counter++;
      existing = await db.get('SELECT id FROM products WHERE id = ?', [productId]);
    }

    // Default templates if empty
    const defaultSpecs = specs || [
      { label: "Servings", value: "1 Port" },
      { label: "Freshness", value: "Daily Baked" },
      { label: "Calories", value: "220 kcal" },
      { label: "Weight", value: "100 g" }
    ];
    const defaultIngredients = ingredients || ['Organic Flour', 'Butter', 'Sugar', 'Gourmet Whipped Cream'];
    const defaultNutrition = nutrition || [
      { name: 'Carbs', percentage: 60 },
      { name: 'Fats', percentage: 40 },
      { name: 'Proteins', percentage: 15 },
      { name: 'Sugars', percentage: 30 }
    ];

    await db.run(`
      INSERT INTO products (
        id, title, category, price, stock, description, src, alt, bg, themeColor, accentColor, textColor, specs, ingredients, nutrition, bgText
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productId,
      title,
      category,
      Number(price),
      Number(stock),
      description || '',
      src,
      alt || title,
      bg || 'radial-gradient(circle at center, #ffffff 0%, #fef3e2 50%, #f1c40f 100%)',
      themeColor || '#7e5109',
      accentColor || '#d4ac0d',
      textColor || '#4a3002',
      JSON.stringify(defaultSpecs),
      JSON.stringify(defaultIngredients),
      JSON.stringify(defaultNutrition),
      bgText || 'BAKERY'
    ]);

    const createdProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.json({
      ...createdProduct,
      specs: JSON.parse(createdProduct.specs),
      ingredients: JSON.parse(createdProduct.ingredients),
      nutrition: JSON.parse(createdProduct.nutrition)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// 3. RESTOCK PRODUCT (Admin Panel)
app.put('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const product = await db.get('SELECT id FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run('UPDATE products SET stock = ? WHERE id = ?', [Number(stock), id]);
    res.json({ id, stock: Number(stock), message: 'Stock updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Helper to get or initialize a cart
const getCart = (cartId) => {
  if (!cartId) return { cartId: null, items: [] };
  if (!carts[cartId]) {
    carts[cartId] = [];
  }
  return { cartId, items: carts[cartId] };
};

// 4. GET CART
app.get('/api/cart', (req, res) => {
  const cartId = req.query.cartId || generateId();
  const cart = getCart(cartId);
  res.json(cart);
});

// 5. ADD TO CART
app.post('/api/cart', async (req, res) => {
  let { cartId, productId, quantity, toppings } = req.body;
  if (!cartId) {
    cartId = generateId();
  }
  const cart = getCart(cartId);
  const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check if item has stock available
  if (product.stock <= 0) {
    return res.status(400).json({ error: 'This item is currently out of stock!' });
  }

  // Toppings signature to identify unique combinations
  const toppingsKey = Object.keys(toppings || {})
    .filter(k => toppings[k])
    .sort()
    .join(',');

  // Check if item with same product and toppings already exists
  const existingItem = cart.items.find(item => 
    item.productId === productId && 
    item.toppingsKey === toppingsKey
  );

  const reqQty = quantity || 1;
  const currentInCart = existingItem ? existingItem.quantity : 0;
  if (currentInCart + reqQty > product.stock) {
    return res.status(400).json({ 
      error: `Cannot add more. Only ${product.stock} items are in stock, and you have ${currentInCart} in your cart.` 
    });
  }

  if (existingItem) {
    existingItem.quantity += reqQty;
  } else {
    cart.items.push({
      id: generateId(),
      productId,
      name: product.title,
      price: product.price,
      src: product.src,
      quantity: reqQty,
      toppings: toppings || {},
      toppingsKey
    });
  }

  res.json({ cartId, items: cart.items });
});

// 6. UPDATE CART ITEM QUANTITY OR TOPPINGS
app.put('/api/cart/item', async (req, res) => {
  const { cartId, itemId, quantity, toppings } = req.body;
  const cart = getCart(cartId);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const item = cart.items[itemIndex];
  if (quantity > 0) {
    // Check stock
    const product = await db.get('SELECT stock FROM products WHERE id = ?', [item.productId]);
    if (product && quantity > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} items in stock.` });
    }
    item.quantity = quantity;
    if (toppings) {
      item.toppings = toppings;
      item.toppingsKey = Object.keys(toppings)
        .filter(k => toppings[k])
        .sort()
        .join(',');
    }
    res.json({ cartId, items: cart.items });
  } else {
    cart.items.splice(itemIndex, 1);
    res.json({ cartId, items: cart.items });
  }
});

// 7. REMOVE FROM CART
app.delete('/api/cart/item', (req, res) => {
  const { cartId, itemId } = req.body;
  const cart = getCart(cartId);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex !== -1) {
    cart.items.splice(itemIndex, 1);
  }

  res.json({ cartId, items: cart.items });
});

// 8. CLEAR CART
app.post('/api/cart/clear', (req, res) => {
  const { cartId } = req.body;
  if (cartId && carts[cartId]) {
    carts[cartId] = [];
  }
  res.json({ cartId, items: [] });
});

// 9. PLACE ORDER (Checks stock, reduces stock, starts 15min timer)
app.post('/api/orders', async (req, res) => {
  try {
    const { cartId, customerName, customerPhone, customerAddress, paymentMethod, paymentStatus } = req.body;
    
    if (!cartId || !customerName || !customerPhone || !customerAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Missing order information details.' });
    }

    const cart = getCart(cartId);
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Cannot place an order.' });
    }

    // Begin check-stock validation
    for (const item of cart.items) {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.name} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.title}. Available: ${product.stock}, requested: ${item.quantity}.` 
        });
      }
    }

    // Reduce stock
    for (const item of cart.items) {
      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }

    // Generate unique order ID
    const orderId = await generateUniqueOrderId(db);

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 20 ? 0 : 2.99;
    const total = subtotal + tax + shipping;

    // Set 15 mins timer
    const timerDuration = 15 * 60 * 1000; // 15 mins in ms
    const timerExpiresAt = new Date(Date.now() + timerDuration).toISOString();

    const orderDate = new Date().toISOString();

    await db.run(`
      INSERT INTO orders (
        id, cartId, items, subtotal, tax, shipping, total, paymentMethod, paymentStatus, orderStatus, customerName, customerPhone, customerAddress, timerExpiresAt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      cartId,
      JSON.stringify(cart.items),
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus || 'Pending',
      'Pending', // Pending -> Preparing -> Out for Delivery -> Delivered
      customerName,
      customerPhone,
      customerAddress,
      timerExpiresAt,
      orderDate
    ]);

    // Clear cart in memory
    carts[cartId] = [];

    const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.json({
      ...order,
      items: JSON.parse(order.items)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 10. GET ALL ORDERS (Admin Panel)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY createdAt DESC');
    const parsedOrders = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
    res.json(parsedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// 11. GET SINGLE ORDER (Tracker)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      ...order,
      items: JSON.parse(order.items)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// 12. UPDATE ORDER STATUS (Admin Panel)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await db.get('SELECT id FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderStatus && paymentStatus) {
      await db.run('UPDATE orders SET orderStatus = ?, paymentStatus = ? WHERE id = ?', [orderStatus, paymentStatus, id]);
    } else if (orderStatus) {
      await db.run('UPDATE orders SET orderStatus = ? WHERE id = ?', [orderStatus, id]);
    } else if (paymentStatus) {
      await db.run('UPDATE orders SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
    }

    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({
      ...updated,
      items: JSON.parse(updated.items)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.listen(PORT, () => {
  console.log(`Bakery Backend API running on http://localhost:${PORT}`);
});
