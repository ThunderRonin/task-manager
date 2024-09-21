import formData from 'form-data'
import Mailgun from 'mailgun.js'
const mailgun = new Mailgun(formData)
const mg = mailgun.client({username: 'api', key: 'abe96e5d2292d2dcddee8b1cb8068eaa-911539ec-f48c87de' || 'key-yourkeyhere'});
const mailGunAPIKey = 'abe96e5d2292d2dcddee8b1cb8068eaa-911539ec-f48c87de'

mg.messages.create('sandbox-123.mailgun.org', {
    from: "Excited User <mailgun@sandbox372fbf759ecd43baac32eb2baa096a83.mailgun.org>",
    to: ["test@example.com"],
    subject: "Hello",
    text: "Testing some Mailgun awesomeness!",
    html: "<h1>Testing some Mailgun awesomeness!</h1>"
})
.then(msg => console.log(msg))
.catch(err => console.log(err))