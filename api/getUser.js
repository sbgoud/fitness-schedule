import { get } from '@vercel/blob';

export default async function handler(request, response) {
  const { username } = request.query;
  console.log('Fetching data for:', username);
  try {
    const { url } = await get(`users/${username}.json`);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Data retrieved:', data);
    return response.status(200).json(data);
  } catch (error) {
    console.log('No data found for:', username);
    return response.status(404).json({ error: 'User data not found' });
  }
}