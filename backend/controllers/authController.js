const user = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const  { sendEmail }  = require("../utils/sendEmail");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const User = await user.create({ name, email, password: hashedPassword, role: "user" });
        if(User) {
            const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
            const message = `
            welcome to ShopNest, ${name}! Thank you for registering with us. 
            Your OTP for email verification is: ${otp}`;
            
            await sendEmail(email, "Welcome to ShopNest - Verify Your Email", message);
            res.status(201).json({
                _id: User._id,
                name: User.name,
                email: User.email,
                role: User.role,
                token: generateToken(User._id),
            });    

        }
    }

    catch (error) {
        res.status(500).json({ error: "Server error", details: error.message });
    }
};


// login user

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const User = await user.findOne({ email });
        if (User && (await bcrypt.compare(password, User.password))) {
            res.json({
                _id: User._id,
                name: User.name,
                email: User.email,
                role: User.role,
                token: generateToken(User._id),
            });
        } else {
            res.status(400).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await user.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { 
    registerUser,
     loginUser,
      getUsers 
    };