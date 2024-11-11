import express from 'express';
import cors from 'cors';
import db from './db.js'; // Archivo de conexión a la base de datos

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos'); // Verifica que esta consulta sea correcta
    res.json(rows); // Devuelve los datos como JSON
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos.' }); // Respuesta de error en JSON
  }
});

app.get('/api/products/category/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT id, nombre_producto AS nombre, descripcion_producto AS descripcion, precio, img1 AS imagen FROM products WHERE categoria_id = ?', [id]);
    res.json(rows); // Devuelve un array de objetos que cumplen con la interfaz Product
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos por categoría.');
  }
});


// Endpoint adicional
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los banners.');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
