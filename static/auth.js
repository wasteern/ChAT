
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const span = document.getElementById("response");

registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    span.innerHTML = null;
    const {login, password, confirmPassword} = registerForm;
    if (password.value != confirmPassword.value) {
        span.style.color = "red";
        return span.innerHTML = "Passwords not match";
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/register");
    xhr.responseType = "json";
    xhr.send(user);
    xhr.onload = () => {
        if (xhr.response.error) {
            span.style.color = "red";
            span.innerHTML = xhr.response.error;
        } else {
            span.style.color = "lime";
            span.innerHTML = xhr.response.res;
            setInterval(() => {
                window.open("/login", "_self")
            }, 1000)
        }
    }
})

loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    span.innerHTML = null;
    const {login, password} = loginForm; // delete confirm password, and change loginform
    // delete condition for check password and confirm password

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/login"); // change api -> login
    xhr.responseType = "json";
    xhr.send(user);
    xhr.onload = () => {
        if (xhr.response.error) {
            span.style.color = "red";
            span.innerHTML = xhr.response.error;
        } else {
            const token = xhr.response.token;
            let date = new Date();
            date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = `token=${token};expires=${date.toString()};`;
            window.location.assign("/");
        }
    }
})