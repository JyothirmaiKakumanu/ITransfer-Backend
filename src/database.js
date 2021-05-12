import {MongoClient} from 'mongodb';

const url = 'mongodb://localhost:27017/fileapp';


export const connect = (callback)=>{
    MongoClient.connect(url, (err, client)=>{
        const db = client.db('fileapp');
        return callback(err,db);
    });
}

