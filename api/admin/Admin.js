const express = require('express');

const AdminController = require("../../controllers/admin/AdminController");

const adminRouter = express.Router();

adminRouter.put('/', AdminController.createAdmin );

adminRouter.post('/auth/login', AdminController.loginAdmin);

module.exports = adminRouter