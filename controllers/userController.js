import User from "../models/userModels.js";
import bcrypt from "bcrypt"
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary"

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password, profilepic } = req.body;
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ message: "user already exists" })
        }

        const newUser = new User({
            name,
            email,
            username,
            profilepic,
            password: hashPassword
        });
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookies(newUser._id, res)
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilepic: newUser.profilepic
            })
        } else {
            res.status(400).json({ message: "invalid user data" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log("Error in signup user", error.message)
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if (!user || !isPasswordCorrect) return res.status(400).json({ message: "Invalid username or password" })

        generateTokenAndSetCookies(user._id, res)

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilepic: user.profilepic
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("Error in loging in user", err.message)
    }
}

const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "user logged out successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("Error in loging in user", err.message)
    }
}


const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id) return res.status(400).json({ message: "You cannot follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(400).json({ message: "User not found" });

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            //Unfollow user
            // Modify current user following, modify follower to userToModify
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json({ message: "user unfollowed successfully" })
        } else {
            // Follow user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            res.status(200).json({ message: "user followed successfully" })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log("Error in follow and unfollow user", error.message)
    }
}

const updateUser = async (req, res) => {

    const { username, name, email, password, bio } = req.body
    let { profilepic } = req.body
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "user not found" })

        if (req.params.id !== userId.toString()) return res.status(400).json({ message: "you cannot update other users profile" })

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilepic) {
            if (user.profilepic) {
                await cloudinary.uploader.destroy(user.profilepic.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilepic);
            profilepic = uploadedResponse.secure_url
        }

        user.name = name || user.name
        user.username = username || user.username
        user.email = email || user.email
        user.profilepic = profilepic || user.profilepic
        user.bio = bio || user.bio

        user = await user.save()

        res.status(200).json({ message: "profile updated successfully", user })

    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log("Error in updating user", error.message)
    }
}

const getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select("-password").select("-updatedAt");
        if (!user) return res.status(400).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Error in updating user", error.message);
    }
}

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile }