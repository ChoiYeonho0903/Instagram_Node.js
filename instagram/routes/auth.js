const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/account', isNotLoggedIn, async (req, res, next) => {
    const {email, name, id, password} = req.body;
    try {
        const exUser = await User.findOne({ where: {id} });
        if (exUser) {
            return res.redirect('/account?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            name,
            id,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect('/?loginError=${info.message}');
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/home');
        });
    }) (req, res, next);
});

router.get('/logout', isLoggedIn, (req,res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;