/**
 * REST endpoint for /guests
 */

const { PrismaClient, PrismaClientKnownRequestError } = require('@prisma/client');
const express = require('express');
const router = express.Router();

const prisma = new PrismaClient();

const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};

router.post("/", asyncMiddleware(async (req, res) => {
    const { name, present, ageGroup } = req.body;

    const result = await prisma.Guest.create({
        data: {
            name,
            present,
            ageGroup
        }
    });
    res.json(result);
}));

router.get('/', asyncMiddleware(async (req, res) => {
    const guests = await prisma.Guest.findMany({
        include: {
            SubGuests: true
        }
    });
    res.json(guests);
}));

router.get('/:id', asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const guest = await prisma.Guest.findFirst({
        where: { id },
        include: {
            SubGuests: true
        }
    });
    res.json(guest);
}));

router.patch('/:id', asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const updated = await prisma.Guest.update({
        where: { id },
        data: req.body,
    });
    res.json(updated);
}));

router.delete('/:id', asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const updated = await prisma.Guest.update({
        where: { id },
        data: {
            SubGuests: {
                set: []
            }
        },
        include: {
            SubGuests: true
        }
    });
    const deleted = await prisma.Guest.delete({
        where: { id },
    });
    res.json(deleted);
}));


module.exports = router;
