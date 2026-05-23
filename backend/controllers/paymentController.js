// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// dotenv = require('dotenv').config();

// const createOrder = async (req, res) => {
//     try {
//         const instance = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });
//         const options = {
//             amount: req.body.amount * 10000, 
//             currency: "INR",
//             receipt: crypto.randomBytes(10).toString("hex"),
//         };
//         const order = await instance.orders.create(options);
//         res.status(200).json(order);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to create order" });
//     }
// };

// const verifyPayment = (req, res) => {
//     try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const generated_signature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(razorpay_order_id + "|" + razorpay_payment_id)
//         .digest("hex");
//         if (generated_signature === razorpay_signature) {
//             res.status(200).json({ message: "Payment verified successfully" });
//         } else {
//             res.status(400).json({ error: "Payment verification failed" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to verify payment" });
//     }
// };

// module.exports = {
//     createOrder,
//     verifyPayment
// };



const Razorpay = require('razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Razorpay keys are not configured" });
    }

    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Razorpay accepts amount in paise
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to create Razorpay order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Razorpay secret is not configured" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = { createOrder, verifyPayment };
