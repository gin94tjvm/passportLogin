const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require('../models/User');

// loginPage
router.get('/login', (req, res) => { res.render('login') });

// registerPage
router.get('/register', (req, res) => { res.render('register') });

// Register Handler
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check password match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // check pass length
    if (password.length < 6) {
        errors.push({ msg: 'password should be at least 6 charcters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // find user from DB
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // set Password to hashed
                            newUser.password = hash;
                            // Save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in')
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err))
                        }));
                }
            })
            .catch(err => console.log(err));
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login')
});

module.exports = router;