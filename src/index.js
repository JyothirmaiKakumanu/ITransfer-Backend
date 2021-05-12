import http from'http';
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

import {connect} from './database';
import AppRouter from './router';

//File Storage config
const storageDir = path.join(__dirname,'..','storage');
const storageConfig = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,storageDir)
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage:storageConfig});
//End of File Storage Config

const PORT =8000;
const app= express();
app.server = http.createServer(app);

app.use(cors({
    exposedHeaders: "*"
}));

app.use(express.json({
    limit:'100mb'
}));
app.set('root',__dirname);
app.set('storageDir',storageDir);
app.set('upload',upload);



//conect to the database
connect((err,db)=>{
    if(err){
        console.log(`An error connecting to the database`,err);
        throw (err);
    }

    app.set('db',db);

    //init routers
     new AppRouter(app);
    


    app.server.listen(process.env.PORT || PORT ,()=>{
        console.log(`App is running on port ${app.server.address().port}`);
    });
})




export default app;


