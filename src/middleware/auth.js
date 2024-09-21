import jwt from 'jsonwebtoken'
import { user } from '../models/users.js'

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const userResult = await user.findOne({ _id: decodedToken._id, 'tokens.token': token })
        if (!userResult) {
            throw new Error()
        }
        req.token = token
        req.user = userResult
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please Authenticate.' })
    }
}

export { auth }