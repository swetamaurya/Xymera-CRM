const express = require("express")
const auth = require("../Middleware/authorization")
const router = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

const { signUp , login  , resetPassword , userPost , getAllUser,getUser ,updatedUser} = require("../controllers/userController");

router.get("/" , (req,res)=>{
    return res.send("Welcome to common user APIs route 💁")
})


router.post("/admin/signup",signUp)
router.post('/login', login)
router.post("/resetPassword",  resetPassword)
router.post("/create",auth, upload.single('image'),userPost)
router.get("/get" ,auth, getUser)
router.get("/getAll" ,auth, getAllUser)
router.post("/update", auth, upload.single('image'),updatedUser)
 
 


module.exports = router