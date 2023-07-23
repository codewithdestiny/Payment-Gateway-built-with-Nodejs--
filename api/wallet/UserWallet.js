const express = require('express');
const userWallet = require("../../controllers/wallet/UserWallet");
const verifyJwtAuthToken = require('../../middleware/verifyToken');
const walletRouter = express.Router();

// walletRouter.put('/send-fund', verifyJwtAuthToken, userWallet.createWallet)

module.exports = walletRouter;