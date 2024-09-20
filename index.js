const app = require("./app");
const port = 3000;

app.listen(port, (req,res)=>{
    console.log(`Running on port ${port}`);
})

