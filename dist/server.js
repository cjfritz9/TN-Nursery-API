var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
export const app = express();
const PORT = process.env._PORT || 8080;
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use((req, _res, next) => {
    const bodyCopy = Object.assign({}, req.body);
    if (bodyCopy.password) {
        bodyCopy.password = 'hidden';
    }
    console.log('<-----Body Logger Start----->');
    console.log('Received: ', new Date().toLocaleString());
    console.log('Request Body: ', bodyCopy);
    console.log('<-----Body Logger End----->');
    next();
});
app.get('/api/usda-zone', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const IP = req.ip;
    const API_KEY = process.env.ABSTRACT_API_KEY;
    const geoResult = yield axios
        .get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${API_KEY}${IP !== '::1' ? `&ip_address=${IP}` : ''}`)
        .then((response) => {
        console.log(response.data);
        return response.data;
    })
        .catch((error) => {
        console.log(error);
    });
    if (geoResult && geoResult.postal_code) {
        const usdaZoneResult = yield axios
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
        }
        else {
            console.log();
            res.send({ error: 'Check Provided Information' });
        }
    }
    else {
        res.send({ error: 'Check Provided Information' });
    }
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is listening on port: ${PORT}`);
}));
