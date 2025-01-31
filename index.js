const express = require("express");
const app = express()
const dotenv = require("dotenv");
const cors = require("cors");
const connection = require("./config/database");
const userRouter = require("./route/userRoute");
   const LeavesRoute = require("./route/leaveRoute");
const DepartmentRouter = require("./route/departmentRoute");
const deleteALLRoute = require("./route/globalRoute");
const visitRouter = require("./route/visitRoute");
const remarkRouter = require("./route/remarkRoute");
const categoryRoutes = require('./route/categoryRoutes');
const productRoutes = require('./route/productRoutes');
const dashboardRouter = require("./route/dashboardRoute");
const locationRoutes = require("./route/laglatRouters");
const searchRoute = require("./route/searchRoutes");

dotenv.config()
PORT = process.env.PORT || 5000

 
app.use(express.json());
app.use(cors())

 
 

app.use("/user",userRouter)
 app.use('/delete',deleteALLRoute)
 app.use("/leaves",LeavesRoute)
app.use('/department',DepartmentRouter)
 app.use("/visit",visitRouter)
 app.use("/remark",remarkRouter)
 app.use('/dashboard', dashboardRouter);
 app.use("/location", locationRoutes);
 app.use('/category', categoryRoutes);
 app.use('/product', productRoutes);
 app.use('/search', searchRoute);
app.get("/test",async (req,res)=>{
    return res.status(200).send("Welcome to Xymera 🙋‍♂️")
})

 
app.listen(PORT , async (req,res)=>{
    try {
        await connection
        console.log("MongoDB is connected.")
    } catch (error) {
        console.log(error)
    }
    console.log(`Server is running on PORT : ${PORT}`)
})


