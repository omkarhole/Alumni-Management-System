
function errorHandler(err,req,res){
console.log(err);
const status=err.status || err.statusCode||500;
res.status(status).json({
    error:err.message || 'Internal Server Error'
});

}
module.exports=errorHandler;