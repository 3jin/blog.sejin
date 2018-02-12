import express from 'express';
import { Tag } from '../db/models';
const router = express.Router();

router.get('/:subnav', function(req, res) {
    const subnav = req.params.subnav;
    Tag
        .find({"belongToMinor": subnav})
        .exec(function (err, tags) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'Could not retrieve tags of ' + subnav
                });
            }
            res.json(tags);
        });
});

export default router;