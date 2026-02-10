import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error ' });
});

app.listen(PORT, () => {
  console.log('`Server is running on http://localhost:${PORT}`');
});
