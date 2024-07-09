import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const Secretkey = process.env.SECRET_KEY

// middleware to Authenticate user using JWT token:
export const authenticationJWT = (req, res, next) => {
    const authHeader = req.headers.authentication;
    try {
        if (!authHeader) {
            return res.json({ 'message': 'Login or Sign up again', "error": "JWT token not found in headers" })
        }

        const userToken = authHeader.split(' ')[1];
        jwt.verify(userToken, Secretkey, (err, data) => {

            if (err) {
               return res.json({ 'message': 'Authentication Failed', "error": 'Token not matches' })
            }

            req.user = data;
            next();
        })
    } catch (err) {
        console.log(err);
        res.json({ 'message': "something went wrong", "error From":"Auth Middleware","error": err });
    }

}