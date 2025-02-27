import { put } from '@vercel/blob';

export default async function handler(request, response) {
  const { username, data } = request.body;
  try {
    await put(`users/${username}.json`, JSON.stringify(data), { access: 'public' });
    response.status(200).json({ message: 'Saved' });
  } catch (error) {
    response.status(500).json({ error: 'Failed to save' });
  }
}