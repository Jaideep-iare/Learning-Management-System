/* eslint-disable no-unused-vars */
const express = require("express")
const path = require("path");


const app = express();

//passport
const passport = require("passport");
const localStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");

//set ejs as view engine
app.set("view engine","ejs")


//files and paths
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));
const {Course, Chapter, Enrollment, Progress, Page, Report, User } = require("./models")

// Parse URL-encoded bodies mostly rich content like in quill editor as key value pairs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//define session duration:
app.use(
    session({
      secret: "my-super-secret-key-215472655657",
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, //24 hours
      },
    })
  );

//ask passport to work with express application:
app.use(passport.initialize());
app.use(passport.session());

//define authentication local strategy for passport:
passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, (usernameField, passwordField, done)=>{
    User.findOne({where: {email: usernameField, password: passwordField }})
    .then((user)=>{
      return done(null,user)//authentication successful
    }).catch((error)=>{
      return error;
    })
  }))

  //After the user authenticated,store user in the session by serializing the user data:
passport.serializeUser((user, done) => {
    console.log("Serializing the user in the session", user.id);
    done(null, user.id);
  });
//deserialize user
passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  });  
  

  //root page
  app.get("/", async (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect("/home");
    } else {
      res.render("index", {
      });
    }
  });


  //home page
app.get("/home",connectEnsureLogin.ensureLoggedIn(), async(req,res)=>{
    const loggedInUser = req.user;
    const facultyCourses = await Course.findFacultyCourse(loggedInUser);
    const availableCourses = await Course.findAvailableCourse(); 
    const enrolledcourses = await Enrollment.findEnrolledCourses(loggedInUser)
    console.log(availableCourses)
    if (req.accepts("html")){
        res.render("home",{
            title: "Home-Learning Management system",
            availableCourses,
            loggedInUser,
            facultyCourses,
            enrolledcourses

        });
    }else{
        console.log("cannot accept the html");
    }
    
})


//enrolled course details page
app.get("/enrolled/:id",connectEnsureLogin.ensureLoggedIn(), (req,res)=>{
    res.render("enrolled",{
        title: "Course Name"
    });
})

// enroll to the course on enroll button
app.post("/enroll/:courseId", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id; 
    const enrollmentStatus = 'enrolled'; // Default status when enrolling
    const initialProgress = 0; // Start progress at 0%

    // Check if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({
      where: {
        studentid: studentId,
        courseid: courseId
      }
    });

    if (existingEnrollment) {
      return res.status(400).send("You are already enrolled in this course.");
    }

    // Create a new enrollment record
    await Enrollment.create({
      studentid: studentId,
      courseid: courseId,
      status: enrollmentStatus,
      progress: initialProgress
    });

    res.redirect("/home"); // Redirect to home or enrolled courses page
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).send("An error occurred while enrolling in the course.");
  }
});


//add chapter to database
app.post("/addcourse/:id",connectEnsureLogin.ensureLoggedIn(), async(req,res)=>{
    try {
        const newcourse = await Course.create({
            coursename: req.body.coursename,
            description: req.body.description,
            facultyid: req.params.id
        });
        res.redirect('/home')
        // console.log("New course added is",newcourse);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating Course');
    }
})

//addchapter display to the course page
app.get("/addchapter/:id",connectEnsureLogin.ensureLoggedIn(),  async (req, res) => {
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
app.post("/addchapter/:id",connectEnsureLogin.ensureLoggedIn(),  async (req, res) => {
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
app.get("/addpage/:id",connectEnsureLogin.ensureLoggedIn(),  async(req,res)=>{
    const chapterId = req.params.id;
    res.render("addpage",{
        title: "Module Name",
        chapterId
    });
})

//viewreport
app.get("/viewreport",connectEnsureLogin.ensureLoggedIn(), (req,res)=>{
    res.render("viewreport",{
        title: "Report"
    });
})

//change password
app.get("/changepassword",connectEnsureLogin.ensureLoggedIn(), (req,res)=>{
    res.render("changepassword",{
        title: "Change password"
    });
})

app.post("/addpage/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const pageName = req.body.pagename;
    const formattedText = req.body.content; // Rich Text content from the add page
    const chapterId = req.params.id;

    // Add page details to Pages table
    /*const newPage = */
    await Page.create({
      pagename: pageName,
      content: formattedText,
      chapterid: chapterId,
    });
    // Find the courseId by querying the Chapter table using chapterId after post
    const chapter = await Chapter.findByPk(chapterId);
    // Redirect back to the previous page i.e, addchapter
    res.redirect(`/addchapter/${chapter.courseid}`);
  } catch (error) {
    console.error("Error adding page:", error);

    res.status(500).send("An error occurred while adding the page. Please try again.");

  }
});





//available course details page
app.get("/available/:id",connectEnsureLogin.ensureLoggedIn(),  async(req,res)=>{
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
          req.login(user, (err)=>{    //these lines are added to initialize session
            if(err){
              console.log(err);
            }
            res.redirect("/home")
          })
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
});

//define session for login using passport.authenticate
app.post(
    "/session",
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res) => {
    //   console.log(req.user);
      res.redirect("/home"); //on successful login
    }
  );

  //signout
app.get("/signout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  });


module.exports = app;