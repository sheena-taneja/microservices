const express = require("express");
const bodyParser = require("body-parser");
const {randomBytes}= require("crypto"); 
const cors = require('cors');
const axios = require("axios");

const app = express();

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());
app.use(cors());

const posts = {};


app.get('/posts',(request,response) => {
    console.log({posts})
    response.send(posts);
})

app.post('/posts',async (request,response) => {
   const postId =  randomBytes(4).toString('hex');
   const {title} = request.body;

   posts[postId] = {
    postId,title
   };

   await axios.post('http://localhost:4005/events',{
    type:'PostCreated',
    data: {postId,title}
   }).catch(e=>console.log({e}));
   response.status(201).send(posts[postId]);
});

app.post('/events',(req,res)=>{
    console.log("Received events",req.body);
    res.send({})
});

app.listen(4000,() => {
    console.log('listening on PORT 4000');
})