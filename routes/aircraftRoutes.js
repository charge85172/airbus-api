import express from 'express';
import * as aircraftController from '../controllers/aircraftController.js';

const router = express.Router();

// Collection Routes
router.route('/')
    .get(aircraftController.getAircrafts)
    .post(aircraftController.createAircraft)
    .options(aircraftController.optionsCollection);

// Detail Routes
router.route('/:id')
    .get(aircraftController.getAircraft)
    .put(aircraftController.updateAircraft)
    .patch(aircraftController.patchAircraft)
    .delete(aircraftController.deleteAircraft)
    .options(aircraftController.optionsDetail);

export default router;