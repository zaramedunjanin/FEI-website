var express = require('express');
var router = express.Router();
var cookieParser = require("cookie-parser");
router.use(cookieParser("secret_passcode"));
var flash = require('connect-flash');
router.use(flash());
const presenter = require("../modules/presenter_db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.get('/',
    function (req, res) {
        res.redirect('/')
    }
);

router.get('/meetings',
    presenter.presenterValid,
    presenter.getMeetings
);

router.get('/meetings/:id/delete',
    presenter.presenterValid,
    presenter.deleteMeeting,
    function (req, res) {
        res.redirect('/presenter/meetings')
    }
);
router.get('/meetings/add',
    presenter.presenterValid,
    function (req, res) {
        res.render('presenter_page/presenter_add_meeting', {profile: req.user.username, layout: "presenter_page/layout"})
    }
);

router.post('/meetings/add',
    presenter.presenterValid,
    presenter.addMeeting,
    function (req, res) {
        res.redirect('/presenter/meetings')
    }
);
router.get('/meetings/:id/invite',
    presenter.presenterValid,
    function (req, res) {
    console.log(req.body.meeting);
        let id = req.params.id;
        res.render('presenter_page/presenter_invite',{id:id, profile: req.user.username, layout: "presenter_page/layout"})
    }
);
router.get('/meetings/:id/edit',
    presenter.presenterValid,
    presenter.editMeeting
);

router.post('/meetings/update',
    presenter.presenterValid,
    presenter.updateMeeting
);

router.get('/meetings/:code',
    presenter.presenterValid,
    presenter.getMeeting
);

router.post('/meetings/message/:id/delete',
    presenter.presenterValid,
    presenter.deleteMessage
);
router.post('/meetings/:id/send-mail',
    presenter.presenterValid,
    presenter.getMeeting2,
    async function(req,res,next){
        try {
            let email = req.body.email;
            let code = req.body.meeting.code;
            let name = req.body.meeting.name;

            var transporter = nodemailer.createTransport({
                service: 'outlook',
                auth: {
                    user: 'fei_projekat@outlook.com',
                    pass: 'FEIprojekat1'
                }
            });
            var mailOptions = {
                from: 'fei_projekat@outlook.com',
                to: JSON.stringify(email),
                subject: 'Fei meeting invite',
                text: req.user.username+' invites you to join their meeting '+name+'. Meeting link is: http://localhost:3000/meeting/'+ code
            };
            await transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    res.redirect('/presenter/meetings');
                }
            });
        } catch (error) {
            return console.log(error);
        }
    }
);

module.exports = router;
