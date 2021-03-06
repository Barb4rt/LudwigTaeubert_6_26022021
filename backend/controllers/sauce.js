const Sauce = require('../models/sauce');
const fs = require('fs');
const { userSetter } = require('core-js/fn/symbol');
const validator = require('validator')
function checkInput(input) {
    const regex = /^[a-zA-Z0-9-\é\è\ê\â\ô\;\,\.\:\"\'\s]+$/;
    for (let value in input) {
        let stringValue = input[value].toString()
        if (regex.test(stringValue) === false || validator.contains(stringValue, '/') === true) {
            return false
        }
    }
    return true
}

exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce);
    if (checkInput(thingObject) === true) {
        const sauce = new Sauce({
            ...thingObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        sauce.save()
            .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
            .catch(error => res.status(400).json({ error }));
    } else {
        res.status(500).json({ message: 'Caractère non valide détecté' });
    }
};

exports.modifyThing = (req, res, next) => {
    const thingObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));

};

exports.deleteThing = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneThing = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.likeOne = (req, res, next) => {
    const user = req.body.userId
    const likeOrDislike = req.body.like
    let message = 'Aucun avis donner'
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const likedArray = sauce.usersLiked
            const dislikedArray = sauce.usersDisliked
            let ArrayIndex = (array) => { array.indexOF(user) }

            if (likeOrDislike === 0) {
                if (dislikedArray.includes(user) === true) {
                    dislikedArray.splice(ArrayIndex, 1)
                } else {
                    likedArray.splice(ArrayIndex, 1)
                }
            } else if (likeOrDislike === 1) {
                likedArray.push(user)
                message = 'Sauce liker !'
            } else if (likeOrDislike === -1) {
                dislikedArray.push(user)
                message = 'Sauce disliker!'
            } else {
                res.status(400).json({ erreur })
            }
            sauce.likes = likedArray.length
            sauce.dislikes = dislikedArray.length
            sauce.save()
                .then(() => res.status(200).json({ message: message }))
        })
        .catch(error => res.status(404).json({ error }))
}

exports.getAllThing = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};