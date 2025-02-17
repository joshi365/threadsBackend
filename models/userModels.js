import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: 6,
        required: true
    },
    profilepic: {
        type: String,
        default: ""
    },
    following: {
        type: [String],
        drfault: []
    },
    followers: {
        type: [String],
        drfault: []
    },
    bio: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
}
)

const User = mongoose.model("User", userSchema)

export default User