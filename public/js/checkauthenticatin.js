
     //validate username

function check_the_name(name_of_the_user) {
    if (name_of_the_user.value.length < 5) {
      name_of_the_user.setCustomValidity(
        "Name should be atleast five characters!"
      );
      name_of_the_user.reportValidity();
    } else {
      name_of_the_user.setCustomValidity("");
    }
  }
   
   //validate email
    function check_the_email(email) {
        if (email.value.includes("@") && email.value.includes(".")) {
          email.setCustomValidity("");
        }
        
        else {
          email.setCustomValidity("Invalid Email. You should include @ and .");
          email.reportValidity();
        }
      }

function check_the_password(password, name_of_the_user) {
    if (password.value.length<8) {
      password.setCustomValidity("password is not strong. Enter atleast 8 characters");
      password.reportValidity();
    }
    else if(password.value == "password"){
      password.setCustomValidity("password is not strong.");
      password.reportValidity();
    }
    else if(password.value==name_of_the_user.value){
      password.setCustomValidity("Username cannot be Password");
      password.reportValidity();
    }
    else {
      password.setCustomValidity("");
    }
  }



var password = document.getElementById("password");
var email = document.getElementById("email");
var name_of_the_user = document.getElementById("name");

name_of_the_user.addEventListener("input", () =>
  check_the_name(name_of_the_user)
);
email.addEventListener("input", () => check_the_email(email));
password.addEventListener("input", () => check_the_password(password,name_of_the_user));


