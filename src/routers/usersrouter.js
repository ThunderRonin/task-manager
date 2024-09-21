import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { user } from '../models/users.js' 
import { auth } from '../middleware/auth.js'
const router = express.Router()

router.post('/users', async (req, res) => {
    const newUser = new user(req.body)

    try {
        await newUser.save()
        const token = await newUser.generateAuthToken()

        res.status(201).send( newUser)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const userResult = await user.findByCredentials(req.body.email, req.body.password)
        const token = await userResult.generateAuthToken()
        res.send({userResult: userResult.getPublicProfile(), token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        }) 
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth,  async (req, res) => {
    res.send(req.user) 
})

const upload = multer({
    limits: {
        fileSize: 1000000
    }
    ,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(202).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
}) 

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(404).send()
        }
        req.user.avatar = undefined
        await req.user.save()
        res.status(202).send({ message: 'Avatar deleted successfully' })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const userResult = await user.findById(req.params.id)
        if (!userResult || !userResult.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(userResult.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const userResult = req.user
        updates.forEach((update) => userResult[update] = req.body[update])
        await userResult.save()
        if (!userResult) {
            return res.status(404).send()
        } else {
            res.send(userResult)
        }
    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

export { router as usersRouter }