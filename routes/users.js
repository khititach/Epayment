const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../Models/User');

//Login Page
router.get('/login',(req , res) => res.render('login'));

//Register Page
router.get('/register',(req , res) => res.render('register'));

 // Test Page
router.get('/testpage',(req , res) => res.render('testpage'));

// Student Page
router.get('/student',(req , res) => res.render('../views/student/studentProfile'));
// router.get('/student', (req , res) => res.send('Test routes'));

// Register Handle
router.post('/register', (req ,res) =>  {
    // console.log(req.body)
    // res.send('hello');
    const { name ,email , password, password2 } = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({ msg: 'Please fill in all fields'});
    }

    //check password match
    if(password !== password2){
        errors.push({ msg:'Password do not match'});
    }

    //check pass length
    if(password.length < 6){
        errors.push({ msg:'Password should be at least 6 characters'});
    }

    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // res.send('pass');
        //validation passed
        User.findOne({ email: email})
        .then(user => {
            if(user){
                //user exits
                errors.push({ msg:'Email is already registered'});
                res.render('register',{
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

                // console.log(newUser)
                // res.send('hello');

                //Hash Password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        // set password to hashed
                        newUser.password = hash;
                        //save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg' ,'You are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                }))
            }
        });
    }


});

// Login Handle
router.post('/login' , (req, res, next) => {
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req , res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;