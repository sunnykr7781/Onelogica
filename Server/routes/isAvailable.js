import express from 'express';
import { User } from '../db/index.js';

const isAvailableRouter = express.Router();

// checking for username availablity
isAvailableRouter.get('/username/:username', async (req, res) => {
    const name = req.params.username;
    if (!name || name.length < 5) {
        return res.json({ 'message': 'name is undefined or length is too short' });
    }

    try {
        const user = await User.findOne({ 'username': name });

        if (!user) {
            return res.json({ 'message': 'username is available' });
        }
        res.json({ 'message': 'username is not available', "error": 'someone is already using this username' })
    } catch (err) {
        res.json({ 'message': 'something went wrong', "error": err });
    }
})

// checking for email availablity
isAvailableRouter.get('/email/:email', async (req, res) => {
    const mail = req.params.email;
    if (!mail) {
        return res.json({ 'message': 'name is undefined' });
    }

    try {
        const user = await User.findOne({ 'email': mail });

        if (!user) {
            return res.json({ 'message': 'email is available' });
        }
        res.json({ 'message': 'email is not available', "error": 'someone is already using this email' })
        
    } catch (err) {
        res.json({ 'message': 'something went wrong', "error": err });
    }
})

export default isAvailableRouter;