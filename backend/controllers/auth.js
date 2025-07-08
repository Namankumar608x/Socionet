const User= require('../models/user');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
//key
const JWT_SECRET = process.env.JWT_SECRET;
// console.log("JWT_SECRET from .env:", JWT_SECRET);


//register controller
exports.register=async(req,res)=>{
    const{username,email,password}=req.body;
    try {
        const existingUser=await User.findOne({email});
        if(existingUser) return res.status(400).json({message:'user already exists'});

        const hashedpassword=await bcrypt.hash(password,10);

        const newUser=new User({username ,email,password:hashedpassword});
        await newUser.save();

        res.status(201).json({message:'user registered successfully'});
        
    }
    catch(error){
        console.error("Register Error:", error.message);
        res.status(500).json({message:'server error'});
    }
};

//login
exports.login=async(req,res)=>{
    const { username,password}= req.body;
    try{
        const user=await User.findOne({username});
        if(!user) return res.status(404).json({message: 'user not found'});

        const match=await bcrypt.compare(password,user.password);
        if(!match) return res.status(404).json({message:'invalid credentials'});

        const token=jwt.sign({ id:user.id},JWT_SECRET,{expiresIn:'10d'});

        res.status(200).json({
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        });

    } catch(err){
        console.error("Login Error:", err.message);
        res.status(500).json({message:'server error'});
    }
};
