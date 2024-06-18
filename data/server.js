const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'projekat',
  password: 'djolemarkofilip',
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.get('/workers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workers');
    const workers = result.rows;
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/workers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
    const worker = result.rows[0];
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/workers', async (req, res) => {
  const { first_name, last_name, address, phone_number, worker_position } = req.body;
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM workers');
    const count = parseInt(countResult.rows[0].count);
    const newId = count + 1;
    const result = await pool.query('INSERT INTO workers (id, first_name, last_name, address, phone_number, worker_position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [newId, first_name, last_name, address, phone_number, worker_position]);
    const newWorker = result.rows[0];
    res.status(201).json(newWorker);
  } catch (error) {
    console.error('Error adding worker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/workers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM workers WHERE id = $1 RETURNING *', [id]);
    const deletedWorker = result.rows[0];
    if (!deletedWorker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    await pool.query('UPDATE workers SET id = id - 1 WHERE id > $1', [id]);
    const updatedResult = await pool.query('SELECT * FROM workers');
    const updatedWorkers = updatedResult.rows;
    res.json({ message: 'Worker deleted successfully', workers: updatedWorkers });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/workers/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, address, phone_number, worker_position } = req.body;
  try {
    const checkResult = await pool.query('SELECT * FROM workers WHERE id = $1', [id]);
    const existingWorker = checkResult.rows[0];
    if (!existingWorker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const result = await pool.query(
      'UPDATE workers SET first_name = $1, last_name = $2, address = $3, phone_number = $4, worker_position = $5 WHERE id = $6 RETURNING *',
      [first_name, last_name, address, phone_number, worker_position, id]
    );
    const updatedWorker = result.rows[0];
    res.json(updatedWorker);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/workers/search', async (req, res) => {
  const { searchTerm } = req.query;
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      const result = await pool.query('SELECT * FROM workers');
      const allWorkers = result.rows;
      res.json(allWorkers);
    } else {
      const result = await pool.query(
        `SELECT * FROM workers
        WHERE LOWER(first_name) ILIKE '%' || LOWER($1) || '%'
           OR LOWER(last_name) ILIKE '%' || LOWER($1) || '%'
           OR LOWER(address) ILIKE '%' || LOWER($1) || '%'
           OR LOWER(phone_number) ILIKE '%' || LOWER($1) || '%'
           OR LOWER(worker_position) ILIKE '%' || LOWER($1) || '%';`,
        [searchTerm]
      );
      const filteredWorkers = result.rows;
      res.json(filteredWorkers);
    }
  } catch (error) {
    console.error('Error searching workers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
