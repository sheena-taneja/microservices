const express = require("express");
const bodyParser = require("body-parser");
const {randomBytes}= require("crypto"); 
const cors = require('cors');
const axios = require("axios");

const app = express();

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments',(request,response) => {
    response.send(commentsByPostId[request.params.id] || []);
})

app.post('/posts/:id/comments',async (request,response) => {
   const commentId =  randomBytes(4).toString('hex');
   const {content} = request.body;
    console.log(request.params.id)
   const comments = commentsByPostId[request.params.id] || [];
   comments.push({id:commentId, content,status:'pending'});

   commentsByPostId[request.params.id] = comments;

   await axios.post('http://localhost:4005/events',{
    type:'CommentCreated',
    data: {
        id: commentId,
        content,
        postId: request.params.id,
        status:'pending'
    }
   })

   response.status(201).send(comments);
});

app.post('/events',async (req,res)=>{
    console.log("Received events",req.body);

    const {type,data} = req.body;

    if(type=="CommentModerated"){
        const {postId,id,status,content} = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id == id;
        });
        comment.status = status;

        await axios.post('http://localhost:4005/events',{
            type:'CommentUpdated',
            data:{
                id,status,postId, content
            }
        })
    }
    res.send({})
});

app.listen(4001,() => {
    console.log('listening on PORT 4001');
})