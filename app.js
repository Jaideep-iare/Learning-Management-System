/* eslint-disable no-unused-vars */
const express = require("express")
const path = require("path");


const app = express();

//set ejs as view engine
app.set("view engine","ejs")


//files and paths
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));
const {Course, Chapter, Enrollment, Progress, Page, Report, User } = require("./models")

// Parse URL-encoded bodies mostly rich content like in quill editor as key value pairs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/",async(req,res)=>{
    const availablecourses = await Course.findAvailableCourse();
    console.log(availablecourses);
    if (req.accepts("html")){
        res.render("home",{
            title: "Home-Learning Management system",
            availablecourses,
        });
    }else{
        console.log("cannot accept the html");
    }
    
})


//enrolled course details page
app.get("/enrolled",(req,res)=>{
    res.render("enrolled",{
        title: "Course Name"
    });
})

//add chapter to database
app.post("/addcourse", async(req,res)=>{
    try {
        const newcourse = await Course.create({
            coursename: req.body.coursename,
            description: req.body.description,
        });
        console.log("New course added is",newcourse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating Course');
    }
})

//addchapter display to the course  page
app.get("/addchapter", async (req,res)=>{
    const allChapters = await Chapter.findAll();
    res.render("addchapter",{
        title: "Add Chapter",
        allChapters,
    });
})

//addchapter send chapter to the course
app.post("/addchapter", async (req, res) => {
    try {
        const newchapter = await Chapter.create({
            chaptername: req.body.chaptername,
            chapterdescription: req.body.chapterdescription
        });
        console.log("New chapter added", newchapter);

        const allChapters = Chapter.findAll();

        if (req.accepts("html")) {
            res.render("addchapter", {
                title: "Add Chapter",
                allChapters,
            });
        } else {
            res.status(200).json(newchapter); // Respond with JSON if not HTML
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating chapter');
    }
});



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


//user signup post request
app.post("/users",async(req,res)=>{
    try {
        const user = await User.create({
            name: req.body.name,
            role: req.body.role,
            email: req.body.email,
            password: req.body.password,
          });
          console.log(user)
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user');
    }
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