const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const dobInput = document.getElementById('dob');

nameInput.addEventListener("input", validateFName);
mobileInput.addEventListener("input", validateMobile);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);
confirmPasswordInput.addEventListener("input", validateConfirmPassword);
dobInput.addEventListener('input', validateDOB);



const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z])$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/


//fname
function validateFName() {
    let name =document.getElementById('name').value.trim()
    // console.log('validating fname');
    if (name.length === 0 || name.length < 3) {
        nameErr.innerHTML = "Name required!";
        return false;
    }else{
        nameErr.innerHTML = "";
    }
    if (name.match(nameRegex)) {
        nameErr.innerHTML = "";
        return true;
    }else{
        nameErr.innerHTML = "No numbers allowed";
        return false;
    }
}

function validateMobile() {
    let mobile =document.getElementById('mobile').value.trim()

    if (mobile.length === 0) {
        mobileErr.innerHTML = "Mobile required!";
        return false;
    }
    if (mobile.length===10) {
        mobileErr.innerHTML = ""
        return true
    }else{
        mobileErr.innerHTML = 'Enter a valid mobile no.'
        return false
    }
}

function validateEmail() {
    let email = emailInput.value.trim()
    if (email.length === 0) {
        emailErr.innerHTML = "Email required!";
        return false;
    }
    if(email.includes(("@"&&"gmail.com")|| ("@"&&"GMAIL.COM"))){
        emailErr.innerHTML="";
    }else{
        emailErr.innerHTML = "email Must contain @ , .com and gmail"
        return false;
    }
}

function validatePassword() {
    let password = passwordInput.value.trim()
    if (password.length === 0) {
        passwordErr.innerHTML = "Password required!";
        return false;
    }else if(password.length < 8){
        passwordErr.innerHTML = 'Password must contain 8 characters'
        return false
    }else{
        passwordErr.innerHTML = ''
    }

    if (!password.match(passwordRegex)) {
        passwordErr.innerHTML = 'Invalid password'
        return false
    }
    passwordErr.innerHTML = ''
    return true
}

function validateConfirmPassword() {
    let password = passwordInput.value.trim()
    let cPassword = confirmPasswordInput.value.trim()
    if (cPassword.length === 0) {
        confirmPasswordErr.innerHTML = "Confirm Password required!";
        return false;
    }
    if (password !== cPassword) {

        confirmPasswordErr.innerHTML = `Passwords doesn't match`
        return false
    }
    confirmPasswordErr.innerHTML = ""
    return true
}

function validateDOB(){
    const dob = document.getElementById('dob').value
    if(new Date(dob) >= new Date()){
        dobErr.innerHTML = 'Enter Valid Date'
        return false
    }
    return true
}



function validateSignUp() {
    return validateFName() && validateLName() && validateMobile() &&  validateEmail() && validatePassword() && validateConfirmPassword()
}

function validateLogin(){
    return validateEmail() 
    // && validatePassword()
}

function validateProfile(){
    return validateFName() && validateLName() && validateMobile() && validateDOB()
}



