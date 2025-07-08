import { Router } from 'express';

const locationController = Router();

const KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!KEY) throw new Error('GOOGLE_MAPS_API_KEY is required');

locationController.post('/autocomplete', async (req, res) => {
  const { input } = req.body;
  if (typeof input !== 'string' || input.length < 1) {
    res.status(400).json({ error: 'Invalid input' });
    return; 
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}` +
    `&key=${encodeURIComponent(KEY)}` +
    `&types=geocode`;

  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    res.status(200).json({ predictions: data.predictions || [] });
    return; 
  } catch (e) {
    console.error('Autocomplete error', e);
    res.status(500).json({ error: 'Autocomplete failed' });
    return; 
  }
});

locationController.post('/details', async (req, res) => {
  const { place_id } = req.body;
  if (typeof place_id !== 'string') {
    res.status(400).json({ error: 'Invalid place_id' });
    return; 
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(place_id)}` +
    `&key=${encodeURIComponent(KEY)}` +
    `&fields=geometry`;

  try {
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    res.status(200).json({ result: data.result || null });
    return; 
  } catch (e) {
    console.error('Details error', e);
    res.status(500).json({ error: 'Details lookup failed' });
    return; 
  }
});

locationController.post('/distance', async (req, res) => {
  const { coordinates } = req.body;
  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    typeof coordinates[0].latitude !== 'number' ||
    typeof coordinates[0].longitude !== 'number' ||
    typeof coordinates[1].latitude !== 'number' ||
    typeof coordinates[1].longitude !== 'number'
  ) {
    res.status(400).json({ error: 'Invalid coordinates.' });
    return; 
  }

  const [start, end] = coordinates;

  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json' +
    `?origins=${start.latitude},${start.longitude}` +
    `&destinations=${end.latitude},${end.longitude}` +
    `&key=${encodeURIComponent(KEY)}` +
    `&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' ||
        !data.rows?.[0]?.elements?.[0] ||
        data.rows[0].elements[0].status !== 'OK') {
      console.error('GMaps DM error:', data);
      res.status(400).json({ error: 'No route found between locations.' });
      return; 
    }

    const element = data.rows[0].elements[0];

    if (!element.distance?.value) {
      console.error('No distance value found:', element);
      res.status(500).json({ error: 'No distance value returned from API.' });
      return;
    }
    
    const meters = element.distance.value;
    const distanceKm = Math.round((meters / 1000) * 100) / 100;

    res.status(200).json({ distanceKm });
    return; 
  } catch (e) {
    console.error('Fetch DM error:', e);
    res.status(500).json({ error: 'Failed to fetch distance.' });
    return; 
  }
});

export default locationController;