const request = require("supertest");
const db = require("../models/index");
var cheerio = require("cheerio");

const app = require("../app");

let server, agent; 

//extract csrf token function
function extractCsrfToken(res) {
    var $ = cheerio.load(res.text);
    return $("[name=_csrf]").val();
  }
// Global setup before all test suites
beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  
  // Global teardown after all test suites
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  


  describe("Faculty Authentication suite", () => {
    
    //signin
    test("Sign up", async () => {
      let res = await agent.get("/signup");
      let csrfToken = extractCsrfToken(res);
  
      res = await agent.post("/users").send({
        name: "Testfaculty",
        role: "faculty",
        email: "user.a@test.com",
        password: "12345678",
        _csrf: csrfToken,
      });
      expect(res.statusCode).toBe(302);
    });


    
  
    //signout
    test("sign-out", async () => {
      //as the agent is the server holding the session, the user is signed in
      //by the previous test case
      let res = await agent.get("/home");
      expect(res.statusCode).toBe(200);
      res = await agent.get("/signout");
      expect(res.statusCode).toBe(302);
      res = await agent.get("/home");
      expect(res.statusCode).toBe(302);
      expect(res.statusCode).toBe(302);
    });

 
    //login
    test("Login", async () => {
        const agent = request.agent(server);
        let res = await agent.get("/login");
        let csrfToken = extractCsrfToken(res);

        // Attempt to log in with invalid credentials
        res = await agent.post("/session").send({
            email: "user.a@test.com",
            password: "wrongpassword",
            _csrf: csrfToken,
        });

        // Expect a redirect back to the login page
        expect(res.statusCode).toBe(302); 

        // Follow the redirect to check if we go back to the login page
        res = await agent.get(res.headers.location);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Invalid password"); 


        //try correct password
        csrfToken = extractCsrfToken(res) //Update csrf
        res = await agent.post("/session").send({
          email: "user.a@test.com",
          password: "12345678",
          _csrf: csrfToken,
        });
        // Expect a redirect after successful login
        expect(res.statusCode).toBe(302);
        res = await agent.get(res.headers.location);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Welcome Testfaculty!"); 
        

        //signout
        res = await agent.get("/signout");
        expect(res.statusCode).toBe(302);

      });

});

  describe("Student Authentication suite", () => {
    //signin
    test("Sign up", async () => {
      let res = await agent.get("/signup");
      let csrfToken = extractCsrfToken(res);
  
      res = await agent.post("/users").send({
        name: "Teststudent",
        role: "student",
        email: "user.b@test.com",
        password: "12345678",
        _csrf: csrfToken,
      });
      expect(res.statusCode).toBe(302);
    });


    
  
    //signout
    test("sign-out", async () => {
      //as the agent is the server holding the session, the user is signed in
      //by the previous test case
      let res = await agent.get("/home");
      expect(res.statusCode).toBe(200);
      res = await agent.get("/signout");
      expect(res.statusCode).toBe(302);
      res = await agent.get("/home");
      expect(res.statusCode).toBe(302);
      expect(res.statusCode).toBe(302);
    });

 
    //login
    test("Login", async () => {
        const agent = request.agent(server);
        let res = await agent.get("/login");
        let csrfToken = extractCsrfToken(res);

        // Attempt to log in with invalid credentials
        res = await agent.post("/session").send({
            email: "user.b@test.com",
            password: "wrongpassword",
            _csrf: csrfToken,
        });

        // Expect a redirect back to the login page
        expect(res.statusCode).toBe(302); 

        // Follow the redirect to check if we go back to the login page
        res = await agent.get(res.headers.location);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Invalid password"); 


        //try correct password
        csrfToken = extractCsrfToken(res) //Update csrf
        res = await agent.post("/session").send({
          email: "user.b@test.com",
          password: "12345678",
          _csrf: csrfToken,
        });
        // Expect a redirect after successful login
        expect(res.statusCode).toBe(302);
        res = await agent.get(res.headers.location);
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Welcome Teststudent!"); 
        

        //signout
        res = await agent.get("/signout");
        expect(res.statusCode).toBe(302);

      });

});
