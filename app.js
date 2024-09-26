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
    // console.log(availablecourses);
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
        // console.log("New course added is",newcourse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating Course');
    }
})

//addchapter display to the course page
app.get("/addchapter/:id", async (req, res) => {
    const courseId = req.params.id;
    try {
        const getChaptersByCourse = await Chapter.getChapters(courseId); // Fetch chapters for this course
        const allPagesOfCourse = await Page.getPages(getChaptersByCourse);

 // Fetch all pages
        
        res.render("addchapter", {
            title: "Add Chapter",
            courseId,
            getChaptersByCourse,
            allPagesOfCourse // Pass allpages to the template
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching chapters and pages');
    }
});


//addchapter send chapter to the course
app.post("/addchapter/:id", async (req, res) => {
    try {
        const courseId = req.params.id
        const newchapter = await Chapter.create({
            chaptername: req.body.chaptername,
            chapterdescription: req.body.chapterdescription,
            courseid: courseId,
        });
        // console.log("New chapter added", newchapter);

        const getChaptersByCourse = await Chapter.getChapters(courseId);
        const allPagesOfCourse = await Page.getPages(getChaptersByCourse);

        if (req.accepts("html")) {
            res.render("addchapter", {
                title: "Add Chapter",
                getChaptersByCourse,
                allPagesOfCourse,
                courseId
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
app.get("/addpage/:id", async(req,res)=>{
    const chapterId = req.params.id;
    console.log("Get Request page add for chapter id",chapterId)
    res.render("addpage",{
        title: "Module Name",
        chapterId
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

app.post("/addpage/:id", async(req, res) => {

    const pageName = req.body.pagename;
    const formattedText = req.body.content; //Rich Text content from the add page
    const chapterId = req.params.id;
    // console.log("Received formatted text:", formattedText, "pagename",pageName, "chapterid",chapterId);

    //add page details to Pages table
    const newPage = await Page.create({
        pagename: pageName,
        content: formattedText,
        chapterid: chapterId
    })
    console.log("New page added", newPage)
  
    // Process or save the formattedText as needed
    res.render("addpage",{
      text:formattedText,
      title: "Module Name",
      chapterId
      });
  });




//available course details page
app.get("/available/:id", async(req,res)=>{
    const courseId = req.params.id;
    const getChaptersByCourse = await Chapter.getChapters(courseId); 
    const course = await Course.findByPk(courseId);
    res.render("available",{
        title: "Course Name",
        getChaptersByCourse,
        course
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