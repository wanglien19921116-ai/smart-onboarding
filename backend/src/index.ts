import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
