const port = process.env.PORT;
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());


//Database Connection with MongoDB
mongoose.connect(process.env.DB_URL).then(() => {
  console.log("Connected to MongoDB");
});
//API Creation




//Image Storage Engine
const storage1 = multer.diskStorage({
  destination: './upload/images',
  limits: { fileSize: 10 * 1024 * 1024 },
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage: storage1 })

//Creating upload endpoint for images
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `https://ecommerce-mern-backend-rzqh.onrender.com/images/${req.file.filename}`
  })
})

//Schema for Creating Products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
})

//AddProduct API endpoint

app.post('/addProduct', async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("saved");
  res.json({
    success: true,
    name: req.body.name,
  })
})

//Creating Api for deleting products 
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  })
})

//Creating API endpoint for  getting all Products

app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("All Products fetched");
  res.send(products);
})

//Creatng Schema for User Model

const Users = mongoose.model('Users', {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  }
})

//Creating Endpoint for registering USers
app.post('/signup', async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: false, errors: "Existing User Found with same email address" })
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  })

  await user.save();

  const data = {
    user: {
      id: user.id
    }
  }

  const token = jwt.sign(data, 'secret_ecom');
  res.json({ success: true, token: token })
})


//Creating End Point For User Login

app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password ===  user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id 
        }
      }
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success: true, token: token });
    }
    else{
      res.json({success:false,errors:"Wrong Password"});
    }
  }
  else{
    res.json({success:false,errors:"Wrong Email Id"});
  }
})

//Creating EndPoint for New Collection Data

app.get('/newcollections',async(req,res)=>{
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollection Fetched");
  res.send(newcollection);
})


//Creating Endpoint Popular in women Section

app.get('/popularinwomen',async(req,res)=>{
  let products = await Product.find({category:"women"});
  let popularinwomen = products.slice(0,4);
    console.log("Popular in Women Fetched");
    res.send(popularinwomen);
})

//Creating EndPoint for Related Products
app.get('/relatedproducts', async (req, res) => {
  let relatedproducts = await Product.find({}); // Find products by category
  let relatedproduct = relatedproducts.slice(0,4);
  console.log("Related Products Fetched");
  res.send(relatedproduct);
})


//Creating middleware to fetch user
const fetchUser = async(req,res,next) => {
  const token = req.header('auth-token');
  if(!token) {
    res.status(401).send({error:"Please authenticate using valid token"})
  }
  else{
    try {
      const data = jwt.verify(token,'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({error:"Please authenticate using valid token"})
    }
  }
}


// Creating endpoint adding products in cartData

app.post('/addtocart',fetchUser,async(req,res)=>{
  // console.log(req.body,req.user);
  console.log("added",req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id});
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
  res.send({message:"Product Added to Cart"});

})

// Creatind EndPoint for removeCartData from cartData
app.post('/removefromcart',fetchUser,async(req,res)=>{
  console.log("removed",req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id});
  if(userData.cartData[req.body.itemId]>0)
  userData.cartData[req.body.itemId] -= 1;

  await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
  res.send({message:"Product Removed from Cart"});
})


//Creating Endpoint to get cartData
app.post('/getcart',fetchUser,async(req,res)=>{
   console.log("GetCart");
   let userData = await Users.findOne({_id:req.user.id});
   res.json(userData.cartData);
})

app.listen(port, (error) => {
  if (error) console.log(error);
  else console.log(`Server is running`);
});
