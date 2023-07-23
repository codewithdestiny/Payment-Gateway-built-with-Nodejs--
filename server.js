const express = require('express');

const mongoose = require('mongoose');

const {corsOptions, connectDb} = require("./config/utility");

require('dotenv').config();

const morgan = require('morgan');


connectDb(); //connect to Db

const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 3500;

const app = express();

app.use(cors(corsOptions));

app.use(express.json())

app.use(express.urlencoded({extended: true}));

app.use(`${process.env.APP_API_BASE_URL}/auth`, require("./api/auth/User"));

app.use(`${process.env.APP_API_BASE_URL}/wallet`, require("./api/wallet/UserWallet"));
app.use('/*', (req, res) => {

    res.json({"error": "Endpoint resource Not Found!"});

})

app.use(morgan('dev'))


mongoose.connection.once('open', () => {

    console.log('Connected to MongoDB');

    app.listen(PORT, (err) => console.log(`Server is running on port ${PORT}`))
})
