// lib/withCors.js
import { cors } from './cors';

export function withCors(handler) {
  return async (req, res) => {
    const ended = await cors(req, res);
    if (ended) return;
    return handler(req, res);
  };
}
