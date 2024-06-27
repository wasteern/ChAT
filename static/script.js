
const socket = io({
    auth: {
        cookie: document.cookie
    }
});

let form = document.getElementById("formMsg");
let input = document.getElementById("inputMsg");
let myId = document.cookie.split("=")[1].split(".")[0];

form.addEventListener("submit", event => {
    event.preventDefault();
    if (input.value) {
        socket.emit("new_message", input.value);
        createMyMsg({
            content: input.value
        });
        input.value = "";
    }
})

socket.on("message", msg => {
    createMsg(msg)
})

function createMsg(msg) {
    let item = document.createElement("li");
    item.textContent = msg.content;
    document.getElementById("messages").appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function createMyMsg(msg) {
    let item = document.createElement("li");
    item.classList.add("my");
    item.textContent = msg.content;
    document.getElementById("messages").appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

socket.on("all_messages", msgArray => {
    msgArray.forEach(msg => {
        if (msg.author_id == myId) {
            createMyMsg(msg)
        } else {
            createMsg(msg)
        }
    })
})

document.getElementById("logout").addEventListener("click", () => {
    document.cookie = "token=;expires=0";
    location.assign("/login")
})