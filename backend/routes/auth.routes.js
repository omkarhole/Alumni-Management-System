const express=require('express');
const {login,signup,logout}=require('../controllers/auth.controller');

const router=express.Router();