const express=require('express');

const {listCarrers,addCareer,updateCareer,deleteCareer}=require('../controllers/career.controller');

const router=express.Router();

// all careers routes 

router.get('/',listCarrers);
router.post('/',addCareer);
router.put('/:id',updateCareer);
router.delete('/:id',deleteCareer);


module.exports=router;