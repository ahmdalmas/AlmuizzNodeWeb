require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path');
const session = require('express-session');
// const nodemailer = require('nodemailer');


// const helmet = require('helmet');
const cors = require('cors');

const port = process.env.PORT || 3000;

// const rateLimit = require('express-rate-limit');


// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// });

// app.use(limiter);
// const corsOptions = {
//     origin: (process.env.SERVER_URL) // Replace with your allowed origin
// };
app.use(cors());
// app.use(helmet());
app.use(session({
    secret: '53d6323b2a326c18da7f0629861a41219db22b3d5d3f52ccbd3dda8a672a0cf5b61f02210399570be8905d6318cd6f6a54e8605e96d2b30e10b174ff025009ed', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(express.json())
app.use(express.static('public'))

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'service.html'));
});
app.get('/tradeFinance', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tradeFinance.html'));
});
app.get('/bankingServices', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bankingServices.html'));
});
app.get('/capitalLending', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'capitalLending.html'));
});
app.get('/wealthManagement', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wealthManagement.html'));
});
app.get('/salesAndMarketing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'salesAndMarketing.html'));
});
app.get('/realEstate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'realEstate.html'));
});
app.get('/bullionInvestment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bullionInvestment.html'));
});
app.get('/crudeOilInvestment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'crudeOilInvestment.html'));
});
app.get('/knowledge', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'knowledge.html'));
});
app.get('/Successful', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'successful.html'));
});
app.get('/payment/Successful', async (req, res) => {
    let { session_id } = req.query;
    let transactionId;
    let amount;
    if (req.session.paymentInProgress) {
        req.session.paymentInProgress = false; // Clear the flag after successful payment
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            transactionId = paymentIntent.id;
            amount = paymentIntent.amount;
        } catch (e) {
            console.error(e);
            return res.status(500).send('An error occurred while retrieving the session');
        }

        amount = amount / 100;
        let formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'AED'
        }).format(amount);


        res.render('successful', { baseUrl: process.env.BASE_URL, tnx_no: transactionId, amount: formattedAmount });
    } else {
        res.status(403).send('Access denied');
    }
});


// app.post('/stripe-webhook', async (req, res) => {
//     const event = req.body;

//     // Handle checkout.session.completed event
//     if (event.type === 'checkout.session.completed') {
//         const session = event.data.object;

//         // Retrieve customer email
//         const customerEmail = session.customer_details.email;

//         // Send email to customer
//         try {
//             await sendEmail(customerEmail, 'Payment Successful', 'Your payment was successful!');
//             console.log('Email sent successfully');
//         } catch (error) {
//             console.error('Error sending email:', error);
//         }
//     }

//     res.status(200).end();
// });



app.post('/checkout', async (req, res) => {

    const deposit = req.body.deposit * 100;
    const email = req.body.email;

    if (isNaN(deposit)) {
        console.error('Invalid deposit amount ann', typeof (deposit));
        return res.status(400).send('Invalid deposit amount');
    }

    try {

        req.session.paymentInProgress = true;

        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: 'aed',
                        product_data: {
                            name: 'Deposit Amount',
                        },
                        unit_amount: deposit,
                    },
                    quantity: 1
                },
            ],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/payment/Successful?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/payment`,
        });

        // console.log(session);
        res.send({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }


});




// Function to send email using Nodemailer
// async function sendEmail(to, subject, text) {
//     let transporter = nodemailer.createTransport({
//         // Configure your email transport here (e.g., SMTP settings)
//         // Example using Gmail SMTP:
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: 'your_email@gmail.com',
//             pass: 'your_email_password'
//         }
//     });

//     let info = await transporter.sendMail({
//         from: 'your_email@gmail.com',
//         to: to,
//         subject: subject,
//         text: text
//     });

//     console.log('Message sent: %s', info.messageId);
// }




// app.listen(port, () => console.log(`Server at :${port}`)) 
