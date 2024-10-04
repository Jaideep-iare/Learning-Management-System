const request = require("supertest");
const db = require("../models/index");
var cheerio = require("cheerio");

const app = require("../app");

let server, agent;

// Extract CSRF token function
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

// Helper function to login the user
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);

  res = await agent.post("/session").send({
    email: username,
    password,
    _csrf: csrfToken,
  });
};

// Helper function to create a new user
const createUser = async (agent, role = "faculty") => {
  let res = await agent.get("/signup");
  let csrfToken = extractCsrfToken(res);
  
  res = await agent.post("/users").send({
    name: role === "faculty" ? "FacultyUser" : "StudentUser",
    role,
    email: role === "faculty" ? "faculty.user@test.com" : "student.user@test.com",
    password: "12345678",
    _csrf: csrfToken,
  });
  return res;
};



// Global setup before all test suites
 beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  server = app.listen(4000, () => {});
  agent = request.agent(server);
  //create new faculty user and logout
  await createUser(agent, "faculty");
  await agent.get("/signout");
  //create new faculty user and logout
  await createUser(agent, "student");
  await agent.get("/signout");
});

// Global teardown after all test suites
afterAll(async () => {
  await db.sequelize.close();
  server.close();
});


describe("Course operations by faculty suite", () => {

  test("Create course as faculty", async () => {
    const agent = request.agent(server);
    await login(agent, "faculty.user@test.com", "12345678");

      // Extract CSRF token from the home page
      let res = await agent.get("/home");
      let csrfToken = extractCsrfToken(res);

      const groupedCourseResponse = await agent.get("/home")
      .set("Accept", "application/json");
      const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);

      // Send request to add course
      const response = await agent.post("/addcourse").send({
        coursename: "course 1 Python for all",
        description: "Learn Python for your needs",
        facultyid: parsedgroupedResponse.loggedInUser.id,  
        _csrf: csrfToken,
      });

      // Expect the course creation to redirect (status code 302)
      expect(response.statusCode).toBe(302);
    }
  );


  test("Add chapter as faculty", async () => {
    const agent = request.agent(server);
    await login(agent, "faculty.user@test.com", "12345678");

      let res = await agent.get("/home");
      let csrfToken = extractCsrfToken(res);

      //first add a course
      await agent.post("/addcourse").send({
        coursename: "course 2 Python for all",
        description: "Learn Python for your needs",
        facultyid: 1,  
        _csrf: csrfToken,
      });
      const groupedCourseResponse = await agent.get("/home")
      .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    const facultyCourseslen = parsedgroupedResponse.facultyCourses.length;
    const latestCourse = parsedgroupedResponse.facultyCourses[facultyCourseslen - 1];
    

      // Extract CSRF token from the add chapter page
      res = await agent.get(`/addchapter/${latestCourse.id}`);
      csrfToken = extractCsrfToken(res);

      // Send request to add chapter
      const response = await agent.post(`/addchapter/${latestCourse.id}`).send({
        chaptername: "Chapter 1",
        chapterdescription: "Chapter1: Learn Python",
        courseid: latestCourse.id,  
        _csrf: csrfToken,
      });

      // Expect the Chapter creation to redirect (status code 302)
      expect(response.statusCode).toBe(302);
    }
  );



  
  test("Add Page as faculty", async () => {
    const agent = request.agent(server);
    await login(agent, "faculty.user@test.com", "12345678");
      let res = await agent.get("/home");
      let csrfToken = extractCsrfToken(res);

      //first add a course
      await agent.post("/addcourse").send({
        coursename: "course 3 Python for all",
        description: "Learn Python for your needs",
        facultyid: 1,  
        _csrf: csrfToken,
      });

      //find latest course
      let groupedCourseResponse = await agent.get("/home")
      .set("Accept", "application/json");
    let parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    let facultyCourseslen = parsedgroupedResponse.facultyCourses.length;
    let latestCourse = parsedgroupedResponse.facultyCourses[facultyCourseslen - 1];

      // Extract CSRF token from the add chapter page
      res = await agent.get(`/addchapter/${latestCourse.id}`);
      csrfToken = extractCsrfToken(res);

      //now add a chapter to the newly created course

      // Send request to add chapter
      await agent.post(`/addchapter/${latestCourse.id}`).send({
        chaptername: "Chapter 1",
        chapterdescription: "Chapter1: Learn Python",
        courseid: latestCourse.id,  
        _csrf: csrfToken,
      });

      //find latest chapter
      groupedCourseResponse = await agent.get(`/addchapter/${latestCourse.id}`)
      .set("Accept", "application/json");
      parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
        const courseChapterslen = parsedgroupedResponse.getChaptersByCourse.length;
        const latestChapter = parsedgroupedResponse.getChaptersByCourse[courseChapterslen-1]

        // Extract CSRF token from the add  page route
        res = await agent.get(`/addpage/${latestChapter.id}`);
        csrfToken = extractCsrfToken(res);

        
      //now add a new page 
      const response = await agent.post(`/addpage/${latestChapter.id}`).send({
        pagename: "Page 1",
        content: "content of page 1",
        chapterid: latestChapter.id,  
        _csrf: csrfToken,
      });

      // Expect the page creation to redirect (status code 302)
      expect(response.statusCode).toBe(302);
    });



    test("Delete Page as faculty", async () => {
        const agent = request.agent(server);
        await login(agent, "faculty.user@test.com", "12345678");
        let res = await agent.get("/home");
        let csrfToken = extractCsrfToken(res);
    
        // First, add a course
        await agent.post("/addcourse").send({
            coursename: "course 4 Python for all",
            description: "Learn Python for your needs",
            facultyid: 1,  
            _csrf: csrfToken,
        });
    
        // Find latest course
        let groupedCourseResponse = await agent.get("/home")
            .set("Accept", "application/json");
        let parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
        let facultyCourseslen = parsedgroupedResponse.facultyCourses.length;
        let latestCourse = parsedgroupedResponse.facultyCourses[facultyCourseslen - 1];
    
        // Extract CSRF token from the add chapter page
        res = await agent.get(`/addchapter/${latestCourse.id}`);
        csrfToken = extractCsrfToken(res);
    
        // Now, add a chapter to the newly created course
        await agent.post(`/addchapter/${latestCourse.id}`).send({
            chaptername: "Chapter 1",
            chapterdescription: "Chapter1: Learn Python",
            courseid: latestCourse.id,  
            _csrf: csrfToken,
        });
    
        // Find latest chapter
        groupedCourseResponse = await agent.get(`/addchapter/${latestCourse.id}`)
            .set("Accept", "application/json");
        parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
        let courseChapterslen = parsedgroupedResponse.getChaptersByCourse.length;
        let latestChapter = parsedgroupedResponse.getChaptersByCourse[courseChapterslen - 1];
    
        // Extract CSRF token from the add page route
        res = await agent.get(`/addpage/${latestChapter.id}`);
        csrfToken = extractCsrfToken(res);
    
        // Now, add a new page
        await agent.post(`/addpage/${latestChapter.id}`).send({
            pagename: "Page 1",
            content: "content of page 1",
            chapterid: latestChapter.id,  
            _csrf: csrfToken,
        });
    
        // Find latest page
        groupedCourseResponse = await agent.get(`/addchapter/${latestCourse.id}`)
            .set("Accept", "application/json");
        parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    
        
        const allPages = parsedgroupedResponse.allPagesOfCourse;
        let chapterPages = allPages.filter(page => page.chapterid === latestChapter.id);
        const latestPage = chapterPages[chapterPages.length-1]
        
        // Extract CSRF token from the add chapter page
        res = await agent.get(`/addchapter/${latestCourse.id}`);
        csrfToken = extractCsrfToken(res);
        
        //now delete
        let response = await agent.delete(`/deletepage/${latestPage.id}`).send({
            _csrf: csrfToken,
          });
        expect(response.statusCode).toBe(200);
        //try delete page same again
        res = await agent.get(`/addchapter/${latestCourse.id}`);
        csrfToken = extractCsrfToken(res);
        response = await agent.delete(`/deletepage/${latestPage.id}`).send({
            _csrf: csrfToken,
          });
        expect(response.statusCode).toBe(404);

    });


    test("Delete Chapter as faculty", async () => {
        const agent = request.agent(server);
        await login(agent, "faculty.user@test.com", "12345678");
          let res = await agent.get("/home");
          let csrfToken = extractCsrfToken(res);
    
          //first add a course
          await agent.post("/addcourse").send({
            coursename: "course 5 Python for all",
            description: "Learn Python for your needs",
            facultyid: 1,  
            _csrf: csrfToken,
          });
    
          //find latest course
          let groupedCourseResponse = await agent.get("/home")
          .set("Accept", "application/json");
        let parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
        let facultyCourseslen = parsedgroupedResponse.facultyCourses.length;
        let latestCourse = parsedgroupedResponse.facultyCourses[facultyCourseslen - 1];
    
          // Extract CSRF token from the add chapter page
          res = await agent.get(`/addchapter/${latestCourse.id}`);
          csrfToken = extractCsrfToken(res);
    
          //now add a chapter to the newly created course
    
          // Send request to add chapter
          await agent.post(`/addchapter/${latestCourse.id}`).send({
            chaptername: "Chapter 1",
            chapterdescription: "Chapter1: Learn Python",
            courseid: latestCourse.id,  
            _csrf: csrfToken,
          });
    
          //find latest chapter
          groupedCourseResponse = await agent.get(`/addchapter/${latestCourse.id}`)
          .set("Accept", "application/json");
          parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
            const courseChapterslen = parsedgroupedResponse.getChaptersByCourse.length;
            const latestChapter = parsedgroupedResponse.getChaptersByCourse[courseChapterslen-1]
    
            // Extract CSRF token from the add  page route
            res = await agent.get(`/addpage/${latestChapter.id}`);
            csrfToken = extractCsrfToken(res);
    
          //now delete a new chapter 
          const response = await agent.delete(`/deletechapter/${latestChapter.id}`).send({
            _csrf: csrfToken,
          });
          expect(response.statusCode).toBe(200);

        });
    


        test("Delete Course as faculty", async () => {
            const agent = request.agent(server);
            await login(agent, "faculty.user@test.com", "12345678");
        
              let res = await agent.get("/home");
              let csrfToken = extractCsrfToken(res);
        
              //first add a course
              await agent.post("/addcourse").send({
                coursename: "course 6 Python for all",
                description: "Learn Python for your needs",
                facultyid: 1,  
                _csrf: csrfToken,
              });
              const groupedCourseResponse = await agent.get("/home")
              .set("Accept", "application/json");
            const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
            const facultyCourseslen = parsedgroupedResponse.facultyCourses.length;
            const latestCourse = parsedgroupedResponse.facultyCourses[facultyCourseslen - 1];
            
        
              // Extract CSRF token from the home
              res = await agent.get(`/home`);
              csrfToken = extractCsrfToken(res);
        
              // Send request to delete chapter
              const response = await agent.delete(`/deletecourse/${latestCourse.id}`).send({ 
                _csrf: csrfToken,
              });
              expect(response.statusCode).toBe(200);
            }
          );

});

describe("Course operations by Student suite", () => {
  test("Preview the course", async()=>{
    const agent = request.agent(server);
    await login(agent, "student.user@test.com", "12345678");
    const groupedCourseResponse = await agent.get("/home")
              .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    let notEnrolledCourseslen = parsedgroupedResponse.notEnrolledCourses.length;

    expect(notEnrolledCourseslen>0).toBe(true)

    let latestAvailableCourse = parsedgroupedResponse.notEnrolledCourses[notEnrolledCourseslen - 1];

    const response = await agent.get(`/available/${latestAvailableCourse.id}`)
    expect(response.statusCode).toBe(200);
  });


  test("Enroll the course", async()=>{
    const agent = request.agent(server);
    await login(agent, "student.user@test.com", "12345678");
    const groupedCourseResponse = await agent.get("/home")
              .set("Accept", "application/json");
    const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    let notEnrolledCourseslen = parsedgroupedResponse.notEnrolledCourses.length;

    expect(notEnrolledCourseslen>0).toBe(true)

    let latestAvailableCourse = parsedgroupedResponse.notEnrolledCourses[notEnrolledCourseslen - 1];

    const response = await agent.get(`/available/${latestAvailableCourse.id}`)
    expect(response.statusCode).toBe(200);
  });

  
  test("Enroll the course", async()=>{
    const agent = request.agent(server);
    await login(agent, "student.user@test.com", "12345678");
    const groupedCourseResponse = await agent.get("/home")
              .set("Accept", "application/json");

    const parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    let notEnrolledCourseslen = parsedgroupedResponse.notEnrolledCourses.length;

    expect(notEnrolledCourseslen>0).toBe(true)

    let latestAvailableCourse = parsedgroupedResponse.notEnrolledCourses[notEnrolledCourseslen - 3];//to get the course which has chapter and page
    
    let res = await agent.get("/home");
    let csrfToken = extractCsrfToken(res);

    const response = await agent.post(`/enroll/${latestAvailableCourse.id}`).send({
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });


  test("Mark page completed", async()=>{
    const agent = request.agent(server);
    await login(agent, "student.user@test.com", "12345678");
    let groupedCourseResponse = await agent.get("/home")
              .set("Accept", "application/json");

    let parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    let enrolledcourseslen = parsedgroupedResponse.enrolledcourses.length;

    expect(enrolledcourseslen>0).toBe(true)

    let latestEnrolledCourse = parsedgroupedResponse.enrolledcourses[enrolledcourseslen - 1];  
    groupedCourseResponse = await agent.get(`/enrolled/${latestEnrolledCourse.courseid}`)
              .set("Accept", "application/json");
    parsedgroupedResponse = JSON.parse(groupedCourseResponse.text);
    const allpages = await db.Page.findAll();
    const pages = allpages.filter(page=>page.chapterid==2);

    let res = await agent.get(`/enrolled/${latestEnrolledCourse.courseid}`);
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post(`/setPageStatus/${pages[0].id}`).send({
      iscompleted: false,
      _csrf: csrfToken,
    });
    
    expect(response.statusCode).toBe(500);
  });


});