const {Career,User}=require('../models/Index')


// print all careers
async function listCarrers(req,res,next){
    try{
        const careers=await Career.findAll({
            include: { model: User, as: 'user', attributes: ['name'] },order: [['id', 'DESC']]
        })
        res.json(careers);

    }
    catch(err){
        next(err);
    }

}

// add careers 
async function addCareer(req,res,next){
    try{
        const career=await Career.create(req.body);
        res.status(201).json(career);
    }
    catch(err){
        next(err);
    }
}
// update careers
async function updateCareer(req,res,next){

    try{
        await Career.update(req.body,{where:{id:req.params.id}});
        res.json({message:'updated successfully'});
    }
    catch(err){
        next(err);
    }

}

// delete careers
async function deleteCareer(req,res,next){
    try{
await Career.destroy({where:{id:req.params.id}});
res.json({message:'deleted successfully'});
    }
    catch(err){
        next(err);
    }
}



module.exports={listCarrers,addCareer,updateCareer,deleteCareer};