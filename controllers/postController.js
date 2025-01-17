import Post from "../models/postModel.js";
import User from "../models/userModels.js";

const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body;

        if (!postedBy || !text) {
            return res.status(400).json({ message: "posted by and text field are required" })
        }

        const user = await User.findById(postedBy)

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        if (user?._id.toString() !== req?.user?._id?.toString()) {
            return res.status(401).json({ message: "Unauthorised" })
        }

        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Text must be less than ${maxLength} characters` })
        }

        const newPost = new Post({ postedBy, text, img })

        await newPost.save()

        res.status(201).json({ message: "Post created successfully", newPost })

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
};

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        res.status(200).json({ post })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log(post, "dawdawda")

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorize to delete post" })
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //unlike post 
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(200).json({ message: "Post unliked successfully" })
        } else {
            //like post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post liked successfully" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const replyToPost = async (req, res) => {
    try {

        const postId = req.params.id;
        const { text } = req.body
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username

        const post = await Post.findById(postId)
        const reply = { userId, text, userProfilePic, username };

        if (!text) {
            return res.status(400).json({ message: "Text field is required" })
        }

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        post.replies.push(reply)
        await post.save()

        res.status(200).json({ message: "Reply added successfully", post })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getFeedPosts = async(req,res) => {
    try {
        const userId = req.user._id;
        console.log(userId,"dadwwadwadwa")
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const following = user.following;

        const feedPosts = await Post.find({postedBy:{$in:following}}).sort({createdAt:-1});

        res.status(200).json({feedPosts})
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts };