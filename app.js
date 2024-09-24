const express = require("express")
const path = require("path");

const app = express();

//set ejs as view engine
app.set("view engine","ejs")


//files and paths
app.use(express.static(path.join(__dirname,"public")));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (for API requests, if needed)
app.use(express.json());

app.get("/",(req,res)=>{
    res.render("home",{
        title: "Learning Management system"
    });
})


//enrolled course details page
app.get("/enrolled",(req,res)=>{
    res.render("enrolled",{
        title: "Course Name"
    });
})

//addchapter to the course  page
app.get("/addchapter",(req,res)=>{
    res.render("addchapter",{
        title: "Course Name"
    });
})


//addpage to the chapter of course
app.get("/addpage",(req,res)=>{
    res.render("addpage",{
        title: "Module Name"
    });
})

//viewreport
app.get("/viewreport",(req,res)=>{
    res.render("viewreport",{
        title: "Report"
    });
})

//change password
app.get("/changepassword",(req,res)=>{
    res.render("changepassword",{
        title: "Change password"
    });
})

app.post("/addpage", (req, res) => {
    const formattedText = req.body.formattedText; // Now, this should not be undefined
    console.log("Received formatted text:", formattedText);
  
    // Process or save the formattedText as needed
    res.render("addpage",{
      text:formattedText,
      title: "Module Name"
      });
  });




//available course details page
app.get("/available",(req,res)=>{
    res.render("available",{
        title: "Course Name"
    });
})



//signup route
app.get("/signup",(req,res)=>{
    res.render("index",{
        title:"signup"
    })
})
//login route
app.get("/login",(req,res)=>{
    res.render("login",{
        title:"login"
    })
})


module.exports = app;