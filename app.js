/* eslint-disable no-unused-vars */
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();

//passport
const passport = require("passport");
const localStrategy = require("passport-local");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");

//bcrypt password hash
const bcrypt = require("bcrypt");
const saltRounds = 10;

//csrf protection
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");

//set ejs as view engine
app.set("view engine", "ejs");

//files and paths
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const {
  Course,
  Chapter,
  Enrollment,
  Progress,
  Page,
  Report,
  User,
  sequelize,
} = require("./models");

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

//use csrf after express
app.use(cookieParser("shh! some secret string"));
app.use(
  csrf(crypto.randomBytes(16).toString("hex"), ["POST", "PUT", "DELETE"])
);

//flash
const flash = require("connect-flash");
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = req.flash();
  next();
});

//define authentication local strategy for passport:
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            // User not found
            return done(null, false, { message: "Invalid username or password" });
          }

          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user); // authentication successful
          } else {
            return done(null, false, { message: "Invalid username or password" });
          }
        })
        .catch((error) => {
          return done(error); // Pass any error to done
        });
    }
  )
);


//After the user authenticated,store user in the session by serializing the user data:
passport.serializeUser((user, done) => {
  // console.log("Serializing the user in the session", user.id);
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
      title: "Signup-Learning Management System",
      csrfToken: req.csrfToken(),
    });
  }
});

//home page
app.get("/home", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const loggedInUser = req.user;
    const facultyCourses = await Course.findFacultyCourse(loggedInUser);
    const availableCourses = await Course.findAvailableCourse();
    const enrolledcourses = await Enrollment.findEnrolledCourses(loggedInUser);

    // Extract courseId from enrolled courses
    const enrolledcourseIds = enrolledcourses.map(
      (enrolled) => enrolled.courseid
    );

    // Find courses that the user has not enrolled in
    const notEnrolledCourses = await Course.getNotEnrolledCourses(
      enrolledcourseIds
    );

    //find the count of enrollments for each course

    const allCourses = [await Course.findAll()];
    // object to store enrollment counts for each course
    var courseEnrollmentCounts = {};
    var coursePageStatus = {};
    for (const courses of allCourses) {
      for (const course of courses) {
        // Ensure course is defined
        if (course && course.id) {
          // Count enrollments for the current course
          const count = await Enrollment.count({
            where: {
              courseid: course.id,
            },
          });
          // Store the count using course.id as the key
          courseEnrollmentCounts[course.id] = count;

          //now to find course completed percentage
          const totalChaptersData = await Chapter.getChapters(course.id);
          const allChaptersIdsForCourse = totalChaptersData.map(
            (chapter) => chapter.id
          );

          // Get the page count for all chapters of the course
          const totalPagesData = await Page.getPagesByChapterIds(
            allChaptersIdsForCourse
          );
          const allPagesIdsForCourse = totalPagesData.map((page) => page.id);
          const totalPages = await Page.getPagesCountByChapterIds(
            allChaptersIdsForCourse
          );
          const completedPages = await Progress.getCompletedPagesCount(
            allPagesIdsForCourse,
            loggedInUser.id,
            true
          );

          // Calculate the completion percentage or status
          const completionPercentage =
            totalPages > 0
              ? Math.floor((completedPages / totalPages) * 100)
              : 0;
          coursePageStatus[course.id] = {
            completedPages,
            totalPages,
            completionPercentage,
            status: completionPercentage === 100 ? "Completed" : "In Progress",
          };
        }
      }
    }
    const allCoursesOfSite = await Course.findAll();

    if (req.accepts("html")) {
      res.render("home", {
        title: "Home-Learning Management system",
        availableCourses,
        loggedInUser,
        facultyCourses,
        enrolledcourses,
        notEnrolledCourses,
        courseEnrollmentCounts,
        coursePageStatus,
        allCoursesOfSite,
        csrfToken: req.csrfToken(),
      });
    } else {
      res.json({
        facultyCourses,
        availableCourses,
        enrolledcourses,
        notEnrolledCourses,
        loggedInUser
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

//enrolled course details page
app.get(
  "/enrolled/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    try {
      // Check if the user is enrolled in the course
      const enrollment = await Enrollment.findOne({
        where: { courseid: courseId, studentid:userId },
      });

      // If not enrolled, redirect to available courses page
      if (!enrollment) {
        return res.redirect(`/available/${courseId}`);
      }

      // If enrolled, fetch course details
      const courseDetails = await Course.findByPk(courseId);
      const getChaptersByCourse = await Chapter.getChapters(courseId); // Fetch chapters for this course
      const totalChaptersData = await Chapter.getChapters(courseId);
      const allChaptersIdsForCourse = totalChaptersData.map(
        (chapter) => chapter.id
      );
      const allPagesOfCourse = await Page.getProgressPagesByUserId(
        allChaptersIdsForCourse,
        userId
      );

      // Log completed pages for debugging
      for (var i = 0; i < allPagesOfCourse.length; i++) {
        if (
          allPagesOfCourse[i].Progresses &&
          allPagesOfCourse[i].Progresses.iscompleted
        ) {
          console.log(
            "pageid",
            allPagesOfCourse[i].id,
            "comp",
            allPagesOfCourse[i].Progresses
          );
        }
      }

      // Fetch all courses for search header
      const allCoursesOfSite = await Course.findAll();

      // Check if request accepts HTML or JSON
      if (req.accepts("html")) {
        res.render("enrolled", {
          title: courseDetails.coursename,
          getChaptersByCourse,
          allPagesOfCourse,
          courseDetails,
          student: userId,
          allCoursesOfSite,
          csrfToken: req.csrfToken(),
        });
      } else {
        res.json({
          allPagesOfCourse,
          allChaptersIdsForCourse,
          courseDetails,
          allCoursesOfSite,
          getChaptersByCourse,
          student: userId,
        });
      }
      
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching chapters and pages");
    }
  }
);

// enroll to the course on enroll button
app.post(
  "/enroll/:courseId",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const studentId = req.user.id;
      const enrollmentStatus = "enrolled"; // Default status when enrolling
      const initialProgress = 0; // Start progress at 0%

      // Check if the student is already enrolled in the course
      const existingEnrollment = await Enrollment.findOne({
        where: {
          studentid: studentId,
          courseid: courseId,
        },
      });

      if (existingEnrollment) {
        return res.status(400).send("You are already enrolled in this course.");
      }

      // Create a new enrollment record
      await Enrollment.create({
        studentid: studentId,
        courseid: courseId,
        status: enrollmentStatus,
        progress: initialProgress,
      });

      res.redirect("/home"); // Redirect to home or enrolled courses page
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).send("An error occurred while enrolling in the course.");
    }
  }
);

//add chapter to database
app.post(
  "/addcourse",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      await Course.create({
        coursename: req.body.coursename,
        description: req.body.description,
        facultyid: req.user.id,
      });
      res.redirect("/home");
      // console.log("New course added is",newcourse);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating Course");
    }
  }
);

//delete course
app.delete("/deletecourse/:id", async (req, res) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).send("Course not found.");
    }
    // delete course from courses table will also reflect on chapters,pages and progress table
    await course.destroy();

    res.status(200).send("Course deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting Course.");
  }
});

//addchapter display to the course page
app.get(
  "/addchapter/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const courseId = req.params.id;
    try {
      const courseDetails = await Course.findByPk(courseId);
      const getChaptersByCourse = await Chapter.getChapters(courseId); // Fetch chapters for this course
      const allPagesOfCourse = await Page.getPages(getChaptersByCourse);

      // for search header
      const allCoursesOfSite = await Course.findAll();
      if (req.accepts("html")) {
        res.render("addchapter", {
          title: courseDetails.coursename + "-Add Chapter",
          courseId,
          getChaptersByCourse,
          allPagesOfCourse, // Pass allpages to the template,
          allCoursesOfSite,
          csrfToken: req.csrfToken(),
        })
      }
      else {
        res.json({

          getChaptersByCourse,
          allPagesOfCourse
          
        });
      }
      ;
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching chapters and pages");
    }
  }
);

//addchapter send chapter to the course
app.post(
  "/addchapter/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const courseId = req.params.id;

      if (!req.body.chaptername || req.body.chaptername.trim() === "") {
        req.flash("error", "Chaptername cannot be empty");
        return res.redirect(`/addchapter/${courseId}`);
      }
      if (
        !req.body.chapterdescription ||
        req.body.chapterdescription.trim() === ""
      ) {
        req.flash("error", "Description cannot be empty");
        return res.redirect(`/addchapter/${courseId}`);
      }
      const newChapter = await Chapter.create({
        chaptername: req.body.chaptername,
        chapterdescription: req.body.chapterdescription,
        courseid: courseId,
      });
      // console.log(newChapter)

      // After successfully adding the chapter, redirect to the same page (or another page)
      res.redirect(`/addchapter/${courseId}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating chapter");
    }
  }
);

//delete chapter
app.delete("/deletechapter/:id", async (req, res) => {
  const chapterId = req.params.id;
  try {
    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).send("Chapter not found.");
    }
    // delete chapter from chapters table will also reflect on pages and progress table
    await chapter.destroy();

    res.status(200).send("Chapter deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting Chapter.");
  }
});

//addpage to the chapter of course
app.get(
  "/addpage/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    // for search header
    const allCoursesOfSite = await Course.findAll();
    const chapterId = req.params.id;
    const chapterDetails = await Chapter.findByPk(chapterId);
    res.render("addpage", {
      title: chapterDetails.chaptername + "-Add Page",
      chapterId,
      allCoursesOfSite,
      csrfToken: req.csrfToken(),
    });
  }
);

app.post(
  "/addpage/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
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

      res
        .status(500)
        .send("An error occurred while adding the page. Please try again.");
    }
  }
);

//delete page from chapter
app.delete("/deletepage/:id", async (req, res) => {
  const pageId = req.params.id;
  try {
    const page = await Page.findByPk(pageId);
    if (!page) {
      return res.status(404).send("Page not found.");
    }
    // delete page from pages table will also reflect on progress table
    await page.destroy();

    res.status(200).send("Page deleted successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting page.");
  }
});

app.post("/setPageStatus/:id", async (req, res) => {
  const studentid = req.user.id;
  const pageid = req.params.id;
  const iscompleted = req.body.iscompleted ? true : false;

  try {
    await Progress.upsert({
      studentid,
      pageid,
      iscompleted,
    });
    res.status(200).send("Progress updated successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating progress.");
  }
});

//viewreport
// Get report for faculty's courses
app.get(
  "/viewreport",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      // Get the logged-in faculty user
      const facultyId = req.user.id;
    

      // Fetch all courses created by this faculty
      const facultyCourses = await Course.findAll({
        where: {
          facultyid: facultyId,
        },
      });

      // Initialize an array to hold report data for each course
      const courseReport = [];

      // Loop through each course and gather report data
      for (const course of facultyCourses) {
        // Get the number of students enrolled in the course
        const totalEnrollments = await Enrollment.count({
          where: {
            courseid: course.id,
          },
        });

        // Get all chapters for this course
        const courseChapters = await Chapter.getChapters(course.id);
        const chapterIds = courseChapters.map((chapter) => chapter.id);

        // Get the total number of pages in all chapters for this course
        const totalPages = await Page.getPagesCountByChapterIds(chapterIds);

        // Get the number of students who have completed the course (i.e., completed all pages)
        const completedStudents = await sequelize.query(
          `
            SELECT e.studentid
            FROM public."Enrollments" e
            JOIN public."Progresses" p ON p.studentid = e.studentid
            WHERE e.courseid = :courseId
            AND p.iscompleted = true
            GROUP BY e.studentid
            HAVING COUNT(p.pageid) = :totalPages
        `,
          {
            replacements: { courseId: course.id, totalPages: totalPages },  //replacements are done to protect from sql query attacks
            type: sequelize.QueryTypes.SELECT,
          }
        );

        // Get the number of students who are currently progressing (not completed)
        const inProgressStudents = totalEnrollments - completedStudents.length;

        // Add report data for this course to the array
        courseReport.push({
          course: course.coursename,
          totalEnrollments,
          completedStudents: completedStudents.length,
          inProgressStudents,
        });
      }

      // For search header 
      const allCoursesOfSite = await Course.findAll();

      // Render the viewreport page with the report data
      res.render("viewreport", {
        title: "Faculty Report",
        courseReport,
        allCoursesOfSite,
      });
    } catch (error) {
      console.error("Error generating faculty report:", error);
      res.status(500).send("An error occurred while generating the report.");
    }
  }
);

//change password display
app.get(
  "/changepassword",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const allCoursesOfSite = await Course.findAll();
    res.render("changepassword", {
      title: "Change password",
      allCoursesOfSite,
      csrfToken: req.csrfToken(),
    });
  }
);

app.post(
  "/changepassword",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const user = req.user;
    const submittedData = req.body;

    try {
      const currentUser = await User.findByPk(user.id);
      const isMatch = await bcrypt.compare(
        submittedData.password,
        currentUser.password
      );

      if (isMatch) {
        return res
          .status(400)
          .send("New password cannot be the same as the old password.");
      }

      if (submittedData.password === submittedData.confirmpassword) {
        const hashedPwd = await bcrypt.hash(submittedData.password, saltRounds);
        await User.updatePassword(user.id, hashedPwd);
        console.log("Password updated successfully");
        return res.redirect("/home");
      } else {
        return res.status(400).send("Passwords do not match.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .send("An error occurred while updating the password.");
    }
  }
);

//available course details page
app.get(
  "/available/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const courseId = req.params.id;
    const userId = req.user.id;

    try {
      // Check if the user is already enrolled in the course
      const enrollment = await Enrollment.findOne({
        where: { courseid: courseId, studentid:userId },
      });

      // If the user is enrolled, redirect to the enrolled course page
      if (enrollment) {
        return res.redirect(`/enrolled/${courseId}`);
      }

      // If not enrolled, fetch course details and chapters
      const getChaptersByCourse = await Chapter.getChapters(courseId);
      const course = await Course.findByPk(courseId, {
        include: {
          model: sequelize.models.User,
          as: "faculty", // The alias for the faculty association
          attributes: ["name"], // Only include the faculty's name
        },
      });

      // Fetch all courses for the search header
      const allCoursesOfSite = await Course.findAll();
      const enrolledStudents = await Enrollment.count({
        where: {
          courseid: courseId,
        },
      });

      // Render the available course page
      res.render("available", {
        title: course.coursename,
        getChaptersByCourse,
        course,
        allCoursesOfSite,
        enrolledStudents,
        csrfToken: req.csrfToken(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching course details");
    }
  }
);


//user signup post request
app.post("/users", async (req, res) => {
  try {
    // Validate input fields
    if (!req.body.name || req.body.name.trim() === "") {
      req.flash("error", "Name cannot be empty");
      return res.redirect("/signup");
    }
    if (!req.body.role || req.body.role.trim() === "") {
      req.flash("error", "Role cannot be empty");
      return res.redirect("/signup");
    }
    if (!req.body.email || req.body.email.trim() === "") {
      req.flash("error", "Email cannot be empty");
      return res.redirect("/signup");
    }
    if (!req.body.password || req.body.password.trim() === "") {
      req.flash("error", "Password cannot be empty");
      return res.redirect("/signup");
    }

    // Hash the user password
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user
    const user = await User.create({
      name: req.body.name,
      role: req.body.role,
      email: req.body.email,
      password: hashedPwd,
    });

    // Log in the user and initialize session
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        req.flash("error", "An error occurred during login.");
        return res.redirect("/signup");
      }
      res.redirect("/home");
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    req.flash("error", "An error occurred while signing up. Please try again.");
    return res.redirect("/signup");
  }
});

//signup route
app.get("/signup", (req, res) => {
  res.render("index", {
    title: "Signup",
    csrfToken: req.csrfToken(),
  });
});
//login route
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

//define session for login using passport.authenticate
app.post("/session", async (req, res, next) => {
  try {
    // Validate input fields
    if (!req.body.email || req.body.email.trim() === "") {
      req.flash("error", "Email cannot be empty");
      return res.redirect("/login");
    }
    if (!req.body.password || req.body.password.trim() === "") {
      req.flash("error", "Password cannot be empty");
      return res.redirect("/login");
    }

    // If validation passes, authenticate the user
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, () => {
      // On successful login
      res.redirect("/home");
    });
  } catch (error) {
    console.error("Error during user Login:", error);
    req.flash("error", "An error occurred while logging in. Please try again.");
    return res.redirect("/login");
  }
});

//signout
app.get("/signout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

//profile
app.get("/profile", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const allCoursesOfSite = await Course.findAll();
  res.render("profile", {
    title: "Profile",
    allCoursesOfSite,
    user: req.user,
    csrfToken: req.csrfToken(),
  });
});

module.exports = app;
