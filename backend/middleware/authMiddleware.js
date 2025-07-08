const jwt=require('jsonwebtoken');

const JWT_SECRET=process.env.JWT_SECRET;

const authMidlleware=(req,res,next)=>{
    const authHeader=req.headers.authorization;

    // token format
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({message:'authorization token missing'})
    }
    const token=authHeader.split(' ')[1];
    try{
        const decoded=jwt.verify(token,JWT_SECRET); // check the validity of token
        req.user=decoded;  // it help us to use req.user.id in protected routes
        next();

    } catch(error){
        console.log(error);
        return res.status(401).json({message:'invalid token'});


    }
};
module.exports = authMidlleware;