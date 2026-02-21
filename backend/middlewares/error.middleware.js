
function errorHandler(err,req,res,next){
console.log(err);
const isMulterError = err?.name === 'MulterError';
const status=err.status || err.statusCode || (isMulterError ? 400 : 500);
const message = isMulterError && err.code === 'LIMIT_FILE_SIZE'
    ? 'Image is too large. Maximum size is 8MB.'
    : err.message || 'Internal Server Error';
res.status(status).json({
    error:message
});

}
module.exports=errorHandler;
