import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const app: Express = express();
const PORT = process.env._PORT || 8080;

app.use(
  cors({
    origin: '*'
  })
);

app.use(express.json());

app.use((req, _res, next) => {
  const bodyCopy = { ...req.body };
  if (bodyCopy.password) {
    bodyCopy.password = 'hidden';
  }

  console.log('<-----Body Logger Start----->');
  console.log('Received: ', new Date().toLocaleString());
  console.log('Request Body: ', bodyCopy);
  console.log('<-----Body Logger End----->');

  next();
});

app.get('/api/usda-zone', async (req, res) => {
  const IP = req.ip;
  const API_KEY = process.env.ABSTRACT_API_KEY;
  const geoResult = await axios
    .get(
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}${
        IP !== '::1' ? `&ip_address=${IP}` : ''
      }`
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  if (geoResult && geoResult.postal_code) {
    const usdaZoneResult = await axios
      .get(`https://phzmapi.org/${geoResult.postal_code}.json`)
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    if (usdaZoneResult && usdaZoneResult.zone) {
      res.send(`${usdaZoneResult.zone}, ${IP}`);
    } else {
      console.log();
      res.send({ error: 'Check Provided Information' });
    }
  } else {
    res.send({ error: 'Check Provided Information' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is listening on port: ${PORT}`);
});
