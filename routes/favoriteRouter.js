const express = require('express');
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors')
const favoriteRouter = express.Router()

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then((favorite)=>{
        if(favorite){
            req.body.forEach((ele)=>{
                if(!favorite.campsites.includes(ele)){
                    favorite.push(ele)
                }
            })
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then((response)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response); 
            })
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findOneAndDelete({user: req.user._id })
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then((favorite)=>{
        if(favorite){
            if(!favorite.campsites.includes(req.params.campsiteId)){
                favorite.campsites.push(req.params.campsiteId)
                favorite.save()
                .then((response)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response); 
                })
                .catch(err => next(err));
            } else {
                res.setHeader('Content-Type', 'text/plain')
                res.statusCode(400)
                res.end("That campsite is already in the list of favorites!");
            }
        } else {
            Favorite.create({
                user: req.user._id,
                campsites: [req.params.campsiteId]
            })
            .then((response)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response); 
            })
            .catch(err => next(err));
        }

    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if(favorite){
            favorite.campsites = favorite.campsites.filter((ele)=>ele!=req.params.campsiteId)
            favorite.save()
            .then((response)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response); 
            })
            .catch(err => next(err));
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.statusCode(400)
            res.end("There are no favorites to delete!");
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;