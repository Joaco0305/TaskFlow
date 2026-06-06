let registerMode = false;

const authForm = document.getElementById("authForm");
const toggleMode = document.getElementById("toggleMode");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

toggleMode.addEventListener("click", () => {

    registerMode = !registerMode;

    if (registerMode) {

        submitBtn.textContent = "Registrarse";
        toggleMode.textContent = "Ya tengo cuenta";

    } else {

        submitBtn.textContent = "Iniciar Sesión";
        toggleMode.textContent = "Crear cuenta";

    }

});

authForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    let users =
        JSON.parse(localStorage.getItem("users")) || [];

    if (registerMode) {

        const exists =
            users.find(user => user.username === username);

        if (exists) {

            message.innerHTML =
                "<span class='text-danger'>Ese usuario ya existe.</span>";

            return;
        }

        users.push({
            username,
            password
        });

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

        message.innerHTML =
            "<span class='text-success'>Cuenta creada correctamente.</span>";

    } else {

        const validUser =
            users.find(
                user =>
                    user.username === username &&
                    user.password === password
            );

        if (!validUser) {

            message.innerHTML =
                "<span class='text-danger'>Usuario o contraseña incorrectos.</span>";

            return;
        }

        localStorage.setItem(
            "taskflowUser",
            username
        );

        window.location.href =
            "dashboard.html";
    }

});
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e){

    e.preventDefault();

    const username =
    document.getElementById("username").value;

    localStorage.setItem(
        "taskflowUser",
        username
    );

    window.location.href =
    "dashboard.html";

});