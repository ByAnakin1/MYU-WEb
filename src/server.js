import express from 'express';
import cors from 'cors';
import db from './db.js'; // Archivo de conexión a la base de datos

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Endpoint para obtener todos los productos
 */
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows); // Devuelve los datos como JSON
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

/**
 * Endpoint para obtener productos por categoría
 */
app.get('/api/products/category/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID de categoría debe ser un número válido.' });
  }
  
  try {
    const [rows] = await db.query(
      'SELECT id, nombre_producto AS nombre, descripcion_producto AS descripcion, precio, img1 AS imagen FROM products WHERE categoria_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos para esta categoría.' });
    }
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener productos por categoría:', err);
    res.status(500).json({ error: 'Error al obtener productos por categoría.' });
  }
});

// Endpoint para obtener los banners
app.get('/api/banners', async (req, res) => {
  try {
    // Consulta para obtener los banners
    const [rows] = await db.query('SELECT * FROM banners');
    res.json(rows); // Devuelve los datos de los banners
  } catch (err) {
    console.error('Error al obtener banners:', err);
    res.status(500).json({ error: 'Error al obtener banners.' });
  }
});

app.get('/api/tiktoks', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tiktok');
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron videos de TikTok.' });
    }
    res.json(rows); // Devuelve los datos de TikTok
  } catch (err) {
    console.error('Error al obtener videos de TikTok:', err);
    res.status(500).json({ error: `Error al obtener videos de TikTok: ${err.message}` });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID debe ser un número válido.' });
  }
  
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    
    res.json(rows[0]); // Devuelve el primer producto (solo uno por ID)
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida o faltante.' });
  }
  const userId = req.cookies.userId; // Verificar si el usuario tiene un ID
  if (!userId) {
    return res.status(400).json({ error: 'Usuario no autenticado.' });
  }
  const timestamp = Date.now();
  db.query('INSERT INTO cart (user_id, product_id, quantity, timestamp) VALUES (?, ?, ?, ?)', 
  [userId, productId, quantity, timestamp], (err, result) => {
    if (err) {
      console.error('Error al agregar producto al carrito:', err);
      return res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
    }
    res.status(200).json({ message: 'Producto agregado al carrito' });
  });
});

app.delete('/api/cart/remove', (req, res) => {
  const { productId } = req.body;
  const userId = req.cookies.userId; // Puedes gestionar usuarios con cookies
  db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: 'Product removed from cart' });
  });
});

// Endpoint para obtener los productos del carrito
app.get('/api/cart', (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Usuario no autenticado.' });
  }
  db.query('SELECT * FROM cart WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener los productos del carrito:', err);
      return res.status(500).json({ error: 'Error al obtener los productos del carrito.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'El carrito está vacío.' });
    }
    res.json(results);
  });
});

// Endpoint para limpiar el carrito después de 24 horas
app.get('/api/cart/clean', (req, res) => {
  const userId = req.cookies.userId;
  const expirationTime = Date.now() - 24 * 60 * 60 * 1000; // 24 horas atrás
  db.query('DELETE FROM cart WHERE user_id = ? AND timestamp < ?', [userId, expirationTime], (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: 'Expired products removed from cart' });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));