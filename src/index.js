import express from 'express'
import multer from 'multer'
import ('./db/mongoose.js')
import { task } from './models/tasks.js'
import { user } from './models/users.js' 
import { usersRouter } from './routers/usersrouter.js'
import { tasksRouter } from './routers/tasksrouter.js'
const app = express()

const upload = multer({
    dest: 'images',
})
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})

app.use(express.json())
app.use(usersRouter)
app.use(tasksRouter)

app.listen(3000, () => console.log('Server is up and running on port 3000!'))
