import express from 'express';
import {Post, User} from '../db/index.js';
import {authenticationJWT} from '../middlewares/auth.js';
import {currentDateWithTime} from '../helpFn.js';
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';


const upload = multer();
const postRouter = express.Router();

dotenv.config();

const CloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const CloudinarySecretKey = process.env.CLOUDINARY_SECRET_KEY
const cloudName = process.env.CLOUDINARY_NAME;


cloudinary.config({
    cloud_name: cloudName,
    api_key: CloudinaryApiKey,
    api_secret: CloudinarySecretKey
});


// get cloudinary photo link route:
postRouter.post('/imageUrlGen', upload.single('image'), async (req, res) => {
    try {
        const imgData = req.file.buffer;

        const response = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((err, uploadResult) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(uploadResult);
                }
            }).end(imgData);
        });

        res.json({message: "File uploaded successfully", imageUrl: response.url});
    } catch (err) {
        console.error('Error uploading image:', err);
        res.json({message: "Image upload failed", error: err.message});
    }
});


// upload post route:
postRouter.post('/upload', authenticationJWT, async (req, res) => {
    const {imageURL, postBody} = req.body;
    try {
        const user = await User.findOne({'username': req.user.username});
        if (!user) {
            // res.json({ "msg": "File uploaded successfully", "imageUrl": result.url });
            return res.json({'message': 'something went wrong!', "error": 'user verified but not  found'})
        }
        const newPost = new Post({
            imageURL,
            postBody,
            'privatePost': false,
            'username': user.username,
            "postDate": currentDateWithTime(),
            'postAuthImg': user.profilePicture
        })
        await newPost.save();
        user.totalPost += 1;
        await user.save();
        res.json({"message": "post uploaded successfully"});
    } catch (err) {
        console.log(err)
        res.json({'message': 'something went wrong', "error": err});
    }
})

// delete post route:
postRouter.post('/delete/:postId', authenticationJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.json({'message': 'post not found', "error": 'maybe postId not correct'});
        }

        const user = await User.findOne({'username': req.user.username});
        const result = await Post.deleteOne(post);

        if (result) {
            user.totalPost -= 1;
            await user.save();
            return res.json({'message': 'post delete successfully'})
        }

        res.json({'message': 'something went wrong during deleting post'})

    } catch (err) {
        res.json({'message': 'something went wrong', "error": err});
    }
})

// user post by page number:
postRouter.get('/getpost/:pageNumber', authenticationJWT, async (req, res) => {
    let page = parseInt(req.params.pageNumber);
    if (page === null || page === undefined) {
        return res.json({'message': 'page number is invalid'})
    }

    const pageSize = 9;
    const start = page * pageSize;

    try {
        const allPosts = await Post.find({'username': req.query.username}).sort({'postDate': 'desc'}).skip(start).limit(pageSize);
        if (allPosts.length === 0) {
            return res.json({'message': 'no more posts'});
        }else{
            res.json({'message': 'post send successfully', "post": allPosts});
        }

    } catch (err) {
        res.json({'message': 'something went wrong', "error": err});
    }
})

// get all post on home screen:
postRouter.get('/homePost/:pageNumber', authenticationJWT, async (req, res) => {
    let page = parseInt(req.params.pageNumber);
    if (page === null || page === undefined) {
        return res.json({'message': 'page number is not defined or null'})
    }
    let pageSize = 3;
    let start = page * 3;
    try {
        const user = await User.findOne({username: req.user.username}).populate('followings')

        if (!user) {
            return res.json({message: 'Something went wrong'});
        }
        const followingList = user.followings;

        if (!followingList || followingList.length === 0) {
            return res.json({message: 'You are not following someone'});
        }
        if (!followingList) {
            return res.json({'message': 'somthing went wrong'})
        }
        const usernames = followingList.map((val) => val.username);

        const allPosts = await Post.find({'username': {$in: usernames}}).sort({'postDate': 'desc'}).skip(start).limit(pageSize);

        if (allPosts.length === 0) {
            return res.json({'message': 'no more posts'});
        }

        res.json({'message': 'post send successfully', 'FeedPosts': allPosts});

    } catch (err) {
        res.json({'message': 'something went wrong', "error": err});
    }
})

// like or dislike a post:

postRouter.post('/like/:postId', authenticationJWT, async (req, res) => {
    try {
        const user = await User.findOne({'username': req.user.username});

        if (!user) {
            return res.json({'message': 'something went wrong, Login again', 'error': 'user verifed but not found!'});
        }
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.json({'message': 'post not found'});
        }

        const isLiked = post.likes.includes(user._id);
        if (isLiked) {
            // dislike the post:
            post.likes.pull(user._id);
            await post.save()
            res.json({'message': 'Post disliked successfully'})
        } else {
            // like the post
            post.likes.push(user);
            await post.save();
            res.json({'message': 'Post Likes successfully'})
        }

    } catch (err) {
        res.json({'message': 'something went wrong', "error": err});
    }
})

// get all user profile who likes the post:
postRouter.get('/like/:postId', authenticationJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('likes');
        if (!post) {
            return res.json({'message': 'post not found'});
        }
        res.json({'message': 'User liked the post', 'allUsers': post.likes})


    } catch (err) {
        res.json({'message': 'something went wrong', "error": err});
    }
})


export default postRouter;