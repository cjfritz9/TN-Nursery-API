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
  app.set('trust proxy', true);
  let IP = req.ip;
  if (IP.startsWith('::ffff:')) {
    IP = IP.slice(7);
  }
  const API_KEY = process.env.ABSTRACT_API_KEY;
  const geoResult = await axios
    .get(
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}${
        IP !== '::1' ? `&ip_address=${IP}` : ''
      }`
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log('geo response error: ', error);
    });
  if (geoResult && geoResult.postal_code) {
    const usdaZoneResult = await axios
      .get(`https://phzmapi.org/${geoResult.postal_code}.json`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log('usda response error',error);
      });
    if (usdaZoneResult && usdaZoneResult.zone) {
      res.send({
        success: 'Success',
        usda_zone: usdaZoneResult.zone
      });
    } else {
      console.log('usda zone result error: ', usdaZoneResult);
      res.send({ error: 'Check Provided Information' });
    }
  } else {
    console.log('geo location result error: ', geoResult);
    res.send({ error: 'Check Provided Information' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
