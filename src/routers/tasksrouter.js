import express from 'express'
import { task } from '../models/tasks.js'
import { auth } from '../middleware/auth.js'
const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const taskResult = new task({
        ...req.body,
        author: req.user._id
    })
    try {
        taskResult.save()
        res.status(201).send(taskResult)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'userTasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.userTasks)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const taskResult = await task.findOne({_id, author: req.user._id})
        if (!taskResult) {
            return res.status(404).send()
        } else {
            res.send(taskResult)
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const taskResult = await task.findOne({_id, author: req.user._id})

        if (!taskResult) {
            return res.status(404).send()
        } else {
            updates.forEach((update) => taskResult[update] = req.body[update])
            await taskResult.save()
            res.send(taskResult)
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const taskResult = await task.findOneAndDelete({_id, author: req.user._id})
        if (!taskResult) {
            return res.status(404).send()
        } else {
            res.send(taskResult)
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

export { router as tasksRouter }