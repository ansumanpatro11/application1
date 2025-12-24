import multer from 'multer';

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/temp');   //folder to store files
    },
    filename:function(req,file,cb){
        cb(null,file.originalname); //keep original file name
    }
});

export const upload=multer({storage,});