const express = require("express");
const bodyParser = require("body-parser"); 
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());
app.use(cors());
const posts={}

const handleEvent = (type,data) => {

    if(type=="PostCreated"){
        const {postId,title} = data;
        posts[postId] = {postId,title,comments:[]};
       }
    
       if(type=="CommentCreated"){
        const {id, content,postId,status} = data;
    
        const post = posts[postId];
        post.comments.push({id,content,status});
       }
    
       if(type=="CommentUpdated"){
        const {id, content,postId,status} = data;
    
        const post = posts[postId];
        const comment =post.comments.find(comment => comment.id==id);
        comment.status=status;
        comment.content=content;
       }

}

app.get('/posts',(request,response) => {
    console.log("getrequest")
   response.send(posts);
});

app.post('/events',async (req,res) => {
   const {type,data} = req.body;

    handleEvent(type,data);

    res.send({});
});

app.listen(4002,async () => {
    console.log('listening on PORT 4002');
    const res = await axios.get('http://localhost:4005/events');
    for(let event of res.data) {
        handleEvent(event.type, event.data)
    }
})