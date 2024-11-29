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

// Endpoint para obtener un producto por su ID
app.get('/api/productos/:id_producto', async (req, res) => {
  const { id_producto } = req.params;

  // Validar si el parámetro es un número válido
  if (isNaN(Number(id_producto))) {
    return res.status(400).json({ error: 'El ID debe ser un número válido.' });
  }

  try {
    // Realizar la consulta en la base de datos
    const [rows] = await db.query(
      'SELECT * FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    // Verificar si se encontró el producto
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    // Devolver el producto encontrado
    res.json(rows[0]); // Se devuelve el primer (y único) producto encontrado
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    res.status(500).json({ error: 'Error al obtener el producto.' });
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


// Endpoint para agregar un producto al carrito
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Faltan datos del producto.' });
  }

  // Buscar si el producto ya está en el carrito del usuario
  const querySelect = `
    SELECT * FROM cart WHERE user_id = ? AND product_id = ?
  `;

  db.query(querySelect, [userId, productId], (err, results) => {
    if (err) {
      console.error('Error al consultar el carrito:', err);
      return res.status(500).json({ error: 'Error al consultar el carrito.' });
    }

    if (results.length > 0) {
      // Si ya existe, actualizar la cantidad
      const queryUpdate = `
        UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?
      `;
      db.query(queryUpdate, [quantity, userId, productId], (err) => {
        if (err) {
          console.error('Error al actualizar el carrito:', err);
          return res.status(500).json({ error: 'Error al actualizar el carrito.' });
        }
        res.json({ success: true, message: 'Cantidad actualizada en el carrito.' });
      });
    } else {
      // Si no existe, insertar el nuevo producto
      const queryInsert = `
        INSERT INTO cart (user_id, product_id, quantity, timestamp)
        VALUES (?, ?, ?, ?)
      `;
      db.query(queryInsert, [userId, productId, quantity, Date.now()], (err) => {
        if (err) {
          console.error('Error al agregar el producto al carrito:', err);
          return res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
        }
        res.json({ success: true, message: 'Producto agregado al carrito.' });
      });
    }
  });
});

// Endpoint para eliminar productos del carrito
app.delete('/api/cart/remove', (req, res) => {
  const { productId } = req.body;
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  const queryDelete = `
    DELETE FROM cart WHERE user_id = ? AND product_id = ?
  `;

  db.query(queryDelete, [userId, productId], (err, result) => {
    if (err) {
      console.error('Error al eliminar el producto del carrito:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto del carrito.' });
    }
    res.json({ success: true, message: 'Producto eliminado del carrito.' });
  });
});

// Endpoint para obtener los productos del carrito
app.get('/api/cart', (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Usuario no autenticado.' });
  }

  const querySelect = `
    SELECT product_id, quantity, timestamp FROM cart WHERE user_id = ?
  `;

  db.query(querySelect, [userId], (err, results) => {
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

  const queryDeleteExpired = `
    DELETE FROM cart WHERE user_id = ? AND timestamp < ?
  `;

  db.query(queryDeleteExpired, [userId, expirationTime], (err, result) => {
    if (err) {
      console.error('Error al limpiar el carrito:', err);
      return res.status(500).json({ error: 'Error al limpiar el carrito.' });
    }
    res.json({ success: true, message: 'Productos expirados eliminados del carrito.' });
  });
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));