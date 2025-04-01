import express from 'express';
import apiLimiter from './rateLimiter';

const app = express();

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

app.get('/api/resource', (req, res) => {
  res.send('Resource data');
});

app.listen(5555, () => {
  console.log('Server is running on port: 5555');
});