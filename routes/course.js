const {Router}=require("express");
const { userMiddleware } = require("../middleware/user");
const courseRouter=Router();
const {purchaseModel,courseModel} = require("../db");

courseRouter.post("/purchase",userMiddleware,async function(req, res) {
    const userId = req.userId;
    console.log(userId);
    const courseId = req.body.courseId;
    await purchaseModel.create({
        userId:userId,
        courseId:courseId
    })
    res.json({
        message: "course purchased successfully"
    })
});

courseRouter.get("/preview", async function(req, res) {

    const courses=await courseModel.find({});
    res.json({
        message: "course preview endpoint",
        courses
    })
});

module.exports = {
    courseRouter: courseRouter
}
