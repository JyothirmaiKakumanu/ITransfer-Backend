import {version} from '../package.json';
import path from 'path';
import _ from 'lodash';
import File from './models/file';
import {ObjectId} from 'mongodb';
import Post from './models/post';

class AppRouter{

    constructor(app){
        this.app = app;
        this.setupRouters();
    }

    setupRouters(){
        const db = this.app.get('db');
        const app = this.app;

          const uploadDir = app.get('storageDir');
          const upload = app.get('upload');
        
        //root routing
        app.get('/', (req,res)=>{
            return res.status(200).json({
                version: version
            });
        });

      
        //Upload Routing
        app.post('/bend/upload', upload.array('files') , (req,res,next)=>{
        //    console.log(`Received file uploaded`,req.files);
           const  files = _.get(req,'files',[]);
           let fileModels = [];

           _.each(files,(fileObject)=>{
               const newFile = new File(app).initWithObject(fileObject).toJSON();
                fileModels.push(newFile);
           });
           console.log("filemodels",fileModels);

           if(fileModels.length){
               console.log("in if line 39");
            //    var collection =  db.collection('files');
            //    db.collection('files');
               db.collection('files').insertMany(fileModels, (err,result)=>{
                    if(err){
                        return res.status(503).json({
                            error: {
                                message: "Unable to save your files",
                            }
                        });
                    }

                    console.log("user request via api/request with data",req,result);
                    let post = new Post(app).initWithObject({

                        from: _.get(req, 'body.from'),
                        to: _.get(req,'body.to'),
                        message: _.get(req,'body.message'),
                        files: result.insertedIds,
                    });

                    //save post object to posts collection in db
                    db.collection('posts').insertOne(post, (err,result)=>{

                        if(err){
                            return res.status(503).json({error: {message: "Upload could not be saved"}})
                        }
                        return res.json(post);
                    });
                    
                    // return res.json({
                    //     files: fileModels
                    // });
                })
                // dbase.close();

           }else{
               return res.status(503).json({
                   error:{message: "File upload is required"},
               });
           }

       
        });

        //Download Routing
        app.get('/bend/download/:id',(req,res,next)=>{
            const fileId = req.params.id;

            db.collection('files').find({_id:ObjectId(fileId)}).toArray((err,result)=>{

                const fileName = _.get(result, '[0].name');
                if(err || !fileName){
                    return rs.status(404).json({
                        error:{
                            message: "File not found."
                        }
                    })
                }

                
                const filePath = path.join(uploadDir, fileName);

                return res.download(filePath, fileName, (err)=>{
                    if(err){
                        return res.status(404).json({
                            error:{
                                message: 'File not found'
                            }
                        })
                    }else{
                        console.log(`File is downloaded.`);
                    }
                });
            });


           
          
        })
    }

}


export default AppRouter;