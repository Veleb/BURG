import { Router } from 'express';

const openRouteServiceController = Router();

openRouteServiceController.post('/distance', async (req, res) => {
  const { coordinates } = req.body;

  if (
    !coordinates ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    typeof coordinates[0].longitude !== 'number' ||
    typeof coordinates[0].latitude !== 'number' ||
    typeof coordinates[1].longitude !== 'number' ||
    typeof coordinates[1].latitude !== 'number'
  ) {
    res.status(400).json({ error: 'Invalid coordinates provided.' });
    return;
  }

  try {
    const apiKey = process.env.ORS_API_KEY + '=';
    if (!apiKey) {
      res.status(500).json({ error: 'ORS API key not configured.' });
      return;
    }

    const [start, end] = coordinates;

    const requestBody = {
      coordinates: [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude]
      ]
    };

    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ORS API error response:', errorText);
      throw new Error(`OpenRouteService API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const distanceMeters = data.routes?.[0]?.summary?.distance;
    
    if (typeof distanceMeters !== 'number') {
      res.status(500).json({ error: 'Distance not found in API response.' });
      return;
    }

    const distanceKm = (distanceMeters / 1000).toFixed(2);

    res.status(200).json({ distanceKm });
  } catch (error) {
    console.error('Error fetching distance:', error);
    res.status(500).json({ error: 'Failed to fetch distance from OpenRouteService.' });
  }
});

export default openRouteServiceController;
