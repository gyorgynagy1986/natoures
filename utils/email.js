/* eslint-disable prettier/prettier */
const nodemailer = require("nodemailer");
const pug = require('pug');
//const htmlToText = require('html-To-text');

// new Email(user, ulr).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split('')[0];
        this.url = url;
        this.from = ` Hello Hello <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {

            return nodemailer.createTransport({
                service: 'SendinBlue',

                   auth: {
                       user: process.env.SENDINBLUE_USERNAME,
                       pass: process.env.SENDINBLUE_PASSWORD
                   }
            });
        }


        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            logger: true,
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {

        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstname: this.firstName,
            url: this.url,
            subject
        })

        // 2) Define email option

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
           // text: htmlToText.fromString(html)
        };

        // 3) Create a transport nad send email

    await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('Welcome', 'Welcome to the Natours Family')
    }

    async sendPasswordReset() {
        await this.send('PasswordReset', 'Your password reset token, (walid for only 10 minutes )')    
    }

};

