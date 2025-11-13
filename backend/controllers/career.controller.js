const {Career,User}=require('../models/index')


// print all careers
async function listCarrers(req,res,next){
    try{
        const careers=await Career.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(careers);

    }
    catch(err){
        next(err);
    }

}

// add careers 
async function addCareer(req,res,next){
    try{
        // Map user_id to user for MongoDB compatibility
        const careerData = {
            company: req.body.company,
            location: req.body.location,
            job_title: req.body.job_title,
            description: req.body.description,
            user: req.body.user_id || req.body.user
        };
        const career=await Career.create(careerData);
        res.status(201).json(career);
    }
    catch(err){
        next(err);
    }
}
// update careers
async function updateCareer(req,res,next){
    try{
        // Map user_id to user for MongoDB compatibility
        const updateData = { ...req.body };
        
        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.id;
        
        // Map user_id to user if present
        if (req.body.user_id) {
            updateData.user = req.body.user_id;
            delete updateData.user_id;
        }
        
        await Career.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({message:'updated successfully'});
    }
    catch(err){
        next(err);
    }

}

// delete careers
async function deleteCareer(req,res,next){
    try{
        await Career.findByIdAndDelete(req.params.id);
        res.json({message:'deleted successfully'});
    }
    catch(err){
        next(err);
    }
}



module.exports={listCarrers,addCareer,updateCareer,deleteCareer};