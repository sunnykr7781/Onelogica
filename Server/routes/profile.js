import express from 'express';
import { User } from '../db/index.js';
import { authenticationJWT } from '../middlewares/auth.js';

const profileRoute = express.Router();

// search user Profile
profileRoute.get('/search/:username', authenticationJWT, async (req, res) => {
    try {
        const currUsername = req.user.username;
        const curr = await User.findOne({ 'username': currUsername })
        const user = await User.findOne({ 'username': req.params.username }).populate('followers').populate('followings');

        if (!user) {
            return res.json({ "message": "User not found" })
        } else {
            res.json({
                'userDetail': user,
                "message": "User Data Send Successfully",
            });
        }

    } catch (err) {
        console.log(err);
        res.json({ 'message': 'something went wrong', "error": err })
    }

})

// update profile route (update user details : profile pic and Description)
profileRoute.post('/updateProfile', authenticationJWT, async (req, res) => {
    const { newProfilePic, newUserDescription } = req.body;

    try {
        const user = await User.findOne({ 'username': req.user.username });

        if (!user) {
            return res.json({ 'message': "Something went wrong" });
        }

        user.profilePicture = newProfilePic || user.profilePicture;
        user.userDescription = newUserDescription || user.userDescription
        await user.save();
        res.json({ 'message': 'Profile successfully updated' })
    } catch (err) {
        res.json({ 'message': 'something went wrong', "error": err });
    }

})

// own profile detail
profileRoute.get('/myprofile', authenticationJWT, async (req, res) => {
    try {
        const user = await User.findOne({ 'username': req.user.username });
        if (user) {
            res.json({
                'userDetails': {
                    "username": user.username,
                    "email": user.email,
                    "profilePicture": user.profilePicture,
                    'totalPost': user.totalPost,
                    "followings": user.followings,
                    "followers": user.followers,
                    "userDescription": user.userDescription
                },
                'message': 'User Data Send Successfully'
            });
        } else {
            res.json({ 'message': 'User not found' });
        }
    } catch (err) {
        res.json({ 'message': 'Something went wrong!' });
    }
})


export default profileRoute;