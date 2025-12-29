// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(error){
//         res.status(500).json({message:error.message});// Internal Server Error
//     }
// }

const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>{
            next(error);
        });
    }
}



export default asyncHandler;