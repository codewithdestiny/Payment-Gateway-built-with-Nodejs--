const express = require('express');

const  registerUser = require('../../controllers/auth/registerUserController');

const userRouter = express.Router();

const  verifyAccountByURI = require('../../controllers/auth/verifyAccountController');

const resendVerifyAccountController = require("../../controllers/auth/resendVerifyAccountController");

const loginUser = require('../../controllers/auth/LoginController');

const changePassword = require('../../controllers/auth/ChangePasswordController');

const verifyJwtAuthToken = require('../../middleware/verifyToken');

const forgotPassword = require('../../controllers/auth/ForgotPasswordController');

const resetPassword = require('../../controllers/auth/ResetPasswordController');

const deleteUser = require('../../controllers/auth/DeleteUserController');

const updateUserSettings = require('../../controllers/auth/UpdateUserSettings');

userRouter.put('/', registerUser);

userRouter.put('/login', loginUser)

userRouter.put('/password/change-password', verifyJwtAuthToken, changePassword);

userRouter.post('/password/reset-password', forgotPassword);

userRouter.put('/update', verifyJwtAuthToken, updateUserSettings);

userRouter.put('/password/new-password/:userId/:token', resetPassword);

userRouter.delete('/delete/:userId', verifyJwtAuthToken, deleteUser);

userRouter.get('/verify/:id/:token', verifyAccountByURI);

userRouter.get('/verify/:email', resendVerifyAccountController)


module.exports = userRouter;