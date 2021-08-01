const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favorite) => {
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    });
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
    if (err) return next(err);

        if (!favorite) {
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                for (i = 0; i < req.body.length; i++ )
                     if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
                        favorite.dishes.push(req.body[i]);
                favorite.save()
                .then((favorite) => {
                         console.log('Fave created');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                     })            
            .catch((err) => {
                return next(err);
            });
        })
            .catch((err) => {
                return next(err);
            })
        }
       
        else {
            for (i = 0; i < req.body.length; i++ )
                if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
                    favorite.dishes.push(req.body[i]);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            .catch((err) => {
                return next(err);
            });
        }
    });    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id}, (err, delfavorite) => {
    if (err) return next(err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(delfavorite);
});
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if (err) return next(err);

    if (!favorite) {
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            favorite.dishes.push({"_id": req.params.dishId});
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
             })            
             .catch((err) => {
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
        })
    }
    else {
        if (favorite.dishes.indexOf(req.params.dishId) < 0) {
            favorite.dishes.push({"_id": req.params.dishId});
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
             })            
             .catch((err) => {
                return next(err);
            })
    }
    else {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end('Dish already exists');
    }
}
    });
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
    if (err) return next(err);

    var index = favorite.dishes.indexOf(req.params.dishId);
    if (index >= 0) {
        favorite.dishes.splice(index,1);
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);  
        })               
    .catch((err) => {
        return next(err);
    })
}
else {
    res.status = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end('Dish not in your favorites list');  
    }
});
});   

module.exports = favoriteRouter;