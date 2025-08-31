import express from 'express'

const app=express();
app.use(express.json());
const port =5000;

app.get("/",(req,res)=>{
    res.send("hello world");
})

app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})