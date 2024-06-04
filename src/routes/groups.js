/**
 * REST endpoint for /groups
 */

const { PrismaClient, PrismaClientKnownRequestError } = require('@prisma/client');
const express = require('express');
const router = express.Router();

const prisma = new PrismaClient();

const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};

router.get('/', asyncMiddleware(async (req, res) => {
    const groups = await prisma.Group.findMany({
        include: {
            guests: true
        }
    });
    res.json(groups);
}));

router.get('/:name', asyncMiddleware(async (req, res) => {
    const { name } = req.params;
    const group = await prisma.Group.findFirst({
        where: { name },
        include: {
            guests: true
        }
    });
    res.json(group);
}));

router.patch('/:name', asyncMiddleware(async (req, res) => {
    const { name } = req.params;
    console.log(req.body);
    const updated = await prisma.Group.update({
        where: { name },
        data: req.body,
    });
    res.json(updated);
}));

router.delete('/:name', asyncMiddleware(async (req, res) => {
    const { name } = req.params;
    const updated = await prisma.Group.update({
        where: { name },
        data: {
            guests: {
                set: []
            }
        },
        include: {
            guests: true
        }
    });
    const deleted = await prisma.Group.delete({
        where: { id },
    });
    res.json(deleted);
}));

module.exports = router;