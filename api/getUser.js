import { get } from '@vercel/blob';

export default async function handler(request, response) {
  const { username } = request.query;
  try {
    const { url } = await get(`users/${username}.json`);
    const res = await fetch(url);
    const data = await res.json();
    response.status(200).json(data);
  } catch (error) {
    response.status(404).json({ error: 'User not found' });
  }
}