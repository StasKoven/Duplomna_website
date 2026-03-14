const express = require('express');
const router = express.Router();

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';
const NP_API_KEY = process.env.NOVA_POSHTA_API_KEY || '';

// Search cities
router.get('/cities', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ cities: [] });

    const response = await fetch(NP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NP_API_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: q,
          Limit: '10',
          Page: '1',
        },
      }),
    });

    const data = await response.json();
    const addresses = data.data?.[0]?.Addresses || [];

    const cities = addresses.map(a => ({
      ref: a.DeliveryCity,
      name: a.Present,
      mainDescription: a.MainDescription,
      area: a.Area,
    }));

    res.json({ cities });
  } catch (error) {
    console.error('Nova Poshta cities error:', error);
    res.status(500).json({ message: 'Помилка пошуку міст' });
  }
});

// Get warehouses by city ref
router.get('/warehouses', async (req, res) => {
  try {
    const { cityRef, q } = req.query;
    if (!cityRef) return res.json({ warehouses: [] });

    const methodProperties = {
      CityRef: cityRef,
      Limit: '50',
      Page: '1',
    };

    if (q) {
      methodProperties.FindByString = q;
    }

    const response = await fetch(NP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: NP_API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties,
      }),
    });

    const data = await response.json();
    const warehouses = (data.data || []).map(w => ({
      ref: w.Ref,
      number: w.Number,
      description: w.Description,
      shortAddress: w.ShortAddress,
      phone: w.Phone,
      schedule: w.Schedule,
    }));

    res.json({ warehouses });
  } catch (error) {
    console.error('Nova Poshta warehouses error:', error);
    res.status(500).json({ message: 'Помилка отримання відділень' });
  }
});

module.exports = router;
