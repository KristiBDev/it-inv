// redo in env later

import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const mongoDBURL = process.env.MONGODB_URL;