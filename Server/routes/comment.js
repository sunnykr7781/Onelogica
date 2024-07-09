import express from 'express';
import { Post, User, Comment } from '../db/index.js';
import { authenticationJWT } from '../middlewares/auth.js';
import { currentDateWithTime } from '../helpFn.js';

const commentRouter = express.Router();

commentRouter.post('/upload/:postId', authenticationJWT, async (req, res) => {
    const { commentBody } = req.body;
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            return res.json({ 'message': 'something went wrong, Login again', 'error': 'user verifed but not found!' });
        }
        const id = req.params.postId
        if (id.length !== 24) {
            return res.json({ 'message': 'post id is not correct' })
        }
        const post = await Post.findById(id);

        if (!post) {
            return res.json({ 'message': 'Post not found' });
        }

        const comment = new Comment({
            commentBody,
            postId: id,
            'postDate': currentDateWithTime(),
            commentAuth: user
        })

        await comment.save();
        res.json({ 'message': 'Comment successfully uploaded' })
    } catch (err) {
        res.json({ 'message': 'something went wrong', "error": err });

    }

})

commentRouter.get('/getAllComment/:postId', authenticationJWT, async (req, res) => {
    try {
        const allComment = await Comment.find({ 'postId': req.params.postId }).populate('commentAuth');
        if (!allComment || allComment.length === 0) {
            return res.json({ 'message': 'No comments' })
        }
        res.json({ 'allComments': allComment, 'message': 'Comments Send Successfully' })
    } catch (err) {
        console.log(err);
        res.json({ 'message': 'something went wrong', "error": err });
    }
})

export default commentRouter;