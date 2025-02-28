import { put } from '@vercel/blob';

export default async function handler(request, response) {
  const { username, data } = request.body;
  console.log('Saving data for:', username, 'Data:', data);
  console.log('Token:', process.env.BLOB_READ_WRITE_TOKEN); // Debug token
  try {
    await put(`users/${username}.json`, JSON.stringify(data), { access: 'public' });
    console.log('Data saved successfully for:', username);
    return response.status(200).json({ message: 'Data saved' });
  } catch (error) {
    console.error('Save error:', error);
    return response.status(500).json({ error: 'Failed to save data' });
  }
}