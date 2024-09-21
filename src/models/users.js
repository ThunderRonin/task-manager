import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { task } from "../models/tasks.js"
const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
                }
            }
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a postive number')
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                 if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain the word "password"')
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }], avatar: {
            type: Buffer
        }
    }, {
        timestamps: true
    })

userSchema.virtual('userTasks', {
    ref: 'task',
    localField: '_id',
    foreignField: 'author'
})


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.getPublicProfile = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const userResult = await user.findOne({ email })

    if (!userResult) {
        throw new Error('Unable to login')
    }
    
    const isMatch = await bcrypt.compare(password, userResult.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }  

    return userResult
}



// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})

// Delete user tasks after deleting user accounts
userSchema.pre('remove', async function (next) {
    const user = this
    await task.deleteMany({ author: user._id })
    next()
})

const user = mongoose.model('User', userSchema)

export { user }
