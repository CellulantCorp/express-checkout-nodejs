/**
 * Author: howard.mnengwa@cellulant.com
 * Date: 2019-05-02
 * Description: An illustration of merchant payload encryption in Nodejs
 * Resources: https://nodejs.org/api/crypto.html, https://www.wikiwand.com/en/Advanced_Encryption_Standard
 */
'use strict';

const port = 3000;
const crypto = require('crypto');
const express = require('express');
const bodyParser = require("body-parser");

const algorithm = 'aes-256-cbc';

const iv_key = '';
const secret_key = '';

let hashed_key = crypto.createHash('sha256').update(secret_key).digest('hex').substring(0, 32);
let hashed_iv = crypto.createHash('sha256').update(iv_key).digest('hex').substring(0, 16);
let key = Buffer.from(hashed_key);
let iv = Buffer.from(hashed_iv);

const app = express();
app.use(bodyParser.json());

app.post('/encrypt', (req, res) => {
    //encrypt
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

    let payload = JSON.stringify(req.body).replace(/\//g, '\\/');
    let encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);

    let base64 = Buffer.from(encrypted, 'binary').toString('base64');
    let encryption = Buffer.from(base64, 'binary').toString('base64');

    //decrypt
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = Buffer.concat([decipher.update(Buffer.from(base64, 'base64', 'binary')), decipher.final()]);

    decrypted = Buffer.from(decrypted).toString();

    res.send({
        assert: decrypted == payload,
        secret: key.toString('hex'),
        iv: iv.toString('hex'),
        encrypted: encryption,
        decrypted: JSON.parse(decrypted)
    });
})

app.listen(port, () => console.log(`Mula express checkout illustration listening to ${port}!`));
