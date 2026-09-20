import './env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './db.js';

import adminRoutes from './routes/admin.js';
import buyerRoutes from './routes/buyer.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import commentRoutes from './routes/comments.js';
import messageRoutes from './routes/messages.js';
import siteRoutes from './routes/site.js';
import cartRoutes from './routes/cart.js';
import reviewRoutes from './routes/reviews.js';
import categoryRoutes from './routes/categories.js';
import db from './db.js';
import { runAutoConfirmOrders } from './utils/orderHelpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/admin', adminRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: '接口不存在，请确认后端服务已重启' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('默认管理员账号: admin / 123456');
  runAutoConfirmOrders(db);
  setInterval(() => runAutoConfirmOrders(db), 60 * 60 * 1000);
});
