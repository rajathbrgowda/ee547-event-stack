const express = require('express');

const router = express.Router()
const loginModel = require('../model/login');
const signupModel = require('../model/signup');
const eventModel = require('../model/event');

//Login
router.get('/login/:id', async (req, res) => {
    try{
        const data = await loginModel.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


//Sign up
router.post('/signup', async (req, res) => {
    console.log(req.body)
    const data = new signupModel({
        name: req.body.name,
        username: req.body.name,
        password: req.body.password,
        gender: req.body.gender,
        degree: req.body.degree,
        school: req.body.school,
        age: req.body.age,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
        registeredEvents: []
    })

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

router.get('/event/', async (req, res) => {   //?location=cpa&type=music&host=4

    const location = req.query?.location;
    const type = req.query?.type;
    const host = req.query?.host;

    if(location && type && host){
        try{
            const data = await eventModel.find({location:location,category:type,adminId:host})
            res.json(data)
        }
        catch(error){
            res.sendStatus(500).json({message: error.message})
        }
    }

    else{
        if(location){
            try{
                const data = await eventModel.find(location)
                res.json(data)
            }
            catch(error){
                res.sendStatus(500).json({message: error.message})
            }
        }
        else if(type){
            try{
                const data = await eventModel.find(type)
                res.json(data)
            }
            catch(error){
                res.sendStatus(500).json({message: error.message})
            }
        }
        else if(host){
            try{
                const data = await eventModel.find(host)
                res.json(data)
            }
            catch(error){
                res.sendStatus(500).json({message: error.message})
            }
        }
    }    
})

module.exports = router;

