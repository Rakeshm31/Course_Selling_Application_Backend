const { Router } = require("express");
const { adminModel,courseModel } = require("../db"); 
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {JWT_ADMIN_PASSWORD}= require("../config");
const { adminMiddleware } = require("../middleware/admin");
const adminRouter = Router();

adminRouter.post("/signup", async function(req, res) {
    //     creatorId: adminId
    // });  checking is admin is the creator of the course
    const requiredBody=z.object({
        email:z.string().email(),
        password:z.string(),
        firstName:z.string().min(1),
        lastName:z.string().min(1)
    })
    const parsedData=requiredBody.safeParse(req.body);
    if(!parsedData.success) {
        return res.status(400).json({
            message: "Invalid data",
            errors: parsedData.error.errors
        });
    }
    const { email, password, firstName, lastName } = req.body;

    try{
        const hashedpassword = await bcrypt.hash(password, 5);
        await adminModel.create({
        email: email,
        password: hashedpassword,
        firstName: firstName,
        lastName: lastName
        });
    }catch(error) {
        return res.status(400).json({
            message: "Admin already exists",
        });
    }
    
    res.json({
        message: "signup succeded"
    });
});

adminRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email });

    if (!admin) {
        return res.status(403).json({
            message: "Incorrect credentials"
        });
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (passwordMatch) {
        const token = jwt.sign(
            { id: admin._id },
            JWT_ADMIN_PASSWORD
        );
        res.json({ token });
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        });
    }
});

adminRouter.post("/course", adminMiddleware,async function(req, res) {
    
    const adminId=req.userId;
    console.log(adminId);

    const {title, description, imageUrl,price} = req.body;

    const course=await courseModel.create({
        title,
        description,
        imageUrl,
        price,
        creatorId:adminId
    });
    res.json({
        message: "course created successfully",
        courseId: course._id
    });
});

adminRouter.put("/course", adminMiddleware,async function(req, res) {
    const adminId=req.userId;

    const {title, description,imageUrl,price,courseId } = req.body;

    // const course=await adminModel.findOne({
    //     _id: courseId,
    //     creatorId: adminId
    // });  checking is admin is the creator of the course
    const course=await courseModel.findOneAndUpdate({
        _id:courseId,
        creatorId: adminId
    },{
        title,
        description,
        imageUrl,
        price
    });
    res.json({
        message: "course updated successfully",
        courseId: course._id
    });
});

adminRouter.get("/course/bulk", adminMiddleware,async function(req, res) {
    const adminId=req.userId;

    const courses=await courseModel.find({
        creatorId: adminId
    });
    res.json({
        message: "courses list",
        courses
    });
    
});

module.exports = {
    adminRouter
};