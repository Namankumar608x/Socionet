const express=require('express');
const router=express.Router();
const authMidlleware=require('../middleware/authMiddleware');

router.get('/profile',authMidlleware,(req,res)=>{
    res.status(200).json({
        message:'welcome to your profile',
        userId:req.user.id // this we will get from token
    });

});

module.exports =router;
