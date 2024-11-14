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



const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
