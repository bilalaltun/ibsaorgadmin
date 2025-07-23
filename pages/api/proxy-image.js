/* eslint-disable */
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('No url');
  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(400).send('Image fetch failed');
    res.setHeader('Content-Type', response.headers.get('content-type'));
    response.body.pipe(res);
  } catch (e) {
    res.status(500).send('Proxy error');
  }
} 