const {Router} = require("express");
const {z} = require("zod");
const { userModel, purchaseModel,courseModel } = require("../db");
const jwt=require("jsonwebtoken");
const userRouter = Router();
const {JWT_USER_PASSWORD} = require("../config");
const { userMiddleware } = require("../middleware/user");
const bcrypt = require("bcrypt");

userRouter.post("/signup", async function(req, res) {
    const requiredBody=z.object({
        email:z.string().email(),
        password:z.string(),
        firstName:z.string().min(1),
        lastName:z.string().min(1)
    })

    const parsedData = requiredBody.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            errors: parsedData.error.errors
        });
    }

    const { email, password, firstName, lastName } = req.body;

    try{
        const hashedpassword = await bcrypt.hash(password,5);
        await userModel.create({
        email: email,
        password: hashedpassword,
        firstName: firstName,
        lastName: lastName
        });
    }catch(error){
        res.json({
            message:"User already exists",
        });
    }
    res.json({
        message: "signup succeded"
    });
});

userRouter.post("/signin", async function(req, res) {

    const { email, password } = req.body;
    const user=await userModel.findOne({
        email: email
    }); 
    if(!user){
        return res.status(403).json({
            message:"User not found"
        })
    }
    const passwordMatch=await bcrypt.compare(password, user.password);
    if(passwordMatch){
        const token=jwt.sign({
            id: user._id
        }, JWT_USER_PASSWORD);
        res.json({
            token: token
        });
    }else{
        res.status(403).json({
            message:"Incorrect credentials"
        })
    }
});

userRouter.get("/purchases",userMiddleware, async function(req, res) {
    const userId=req.userId;

    const purchases=await purchaseModel.find({ userId:userId});

    const courseData=await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId) }
    })

    res.json({
        message: "user purchased courses endpoint",
        purchases,
        courseData
    });
});

module.exports = {
    userRouter
};

