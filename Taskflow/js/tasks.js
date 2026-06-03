const user = localStorage.getItem("taskflowUser");

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("welcomeUser").textContent =
    `Bienvenido, ${user}`;

document.getElementById("settingsUser").textContent =
    user;

/* =========================
   DATOS
========================= */

let allTasks =
    JSON.parse(localStorage.getItem(`${user}-tasks`)) || [];

let editingId = null;

let currentDate = new Date();

/* =========================
   ELEMENTOS
========================= */

const taskInput =
    document.getElementById("taskInput");

const taskDate =
    document.getElementById("taskDate");

const taskPriority =
    document.getElementById("taskPriority");

    const taskCategory =
    document.getElementById("taskCategory");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskList =
    document.getElementById("taskList");

const searchTask =
    document.getElementById("searchTask");

const filterTasks =
    document.getElementById("filterTasks");

const logoutBtn =
    document.getElementById("logoutBtn");

const themeToggle =
    document.getElementById("themeToggle");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");

/* =========================
   SECCIONES
========================= */

const menuTasks =
    document.getElementById("menuTasks");

const menuCalendar =
    document.getElementById("menuCalendar");

const menuSettings =
    document.getElementById("menuSettings");

const tasksSection =
    document.getElementById("tasksSection");

const calendarSection =
    document.getElementById("calendarSection");

const settingsSection =
    document.getElementById("settingsSection");

/* =========================
   NAVEGACION
========================= */

menuTasks.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("tasks");
});

menuCalendar.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("calendar");
    renderCalendar();
});

menuSettings.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("settings");
});

function showSection(section) {

    tasksSection.classList.add("hidden-section");
    calendarSection.classList.add("hidden-section");
    settingsSection.classList.add("hidden-section");

    menuTasks.classList.remove("active");
    menuCalendar.classList.remove("active");
    menuSettings.classList.remove("active");

    if (section === "tasks") {
        tasksSection.classList.remove("hidden-section");
        menuTasks.classList.add("active");
    }

    if (section === "calendar") {
        calendarSection.classList.remove("hidden-section");
        menuCalendar.classList.add("active");
    }

    if (section === "settings") {
        settingsSection.classList.remove("hidden-section");
        menuSettings.classList.add("active");
    }
}

/* =========================
   HELPERS
========================= */

function getUserTasks() {
    return allTasks.filter(
        task => task.owner === user
    );
}

function saveTasks() {
    localStorage.setItem(
        `${user}-tasks`,
        JSON.stringify(allTasks)
    );
}
function renderAlerts() {

    const container =
        document.getElementById(
            "alertsContainer"
        );

    if (!container) return;

    const userTasks =
        getUserTasks();

    const today =
        new Date()
        .toISOString()
        .split("T")[0];

    const overdue =
        userTasks.filter(task =>

            !task.completed &&
            task.date &&
            task.date < today

        ).length;

    const dueToday =
        userTasks.filter(task =>

            !task.completed &&
            task.date === today

        ).length;

    let html = "";

    if (overdue > 0) {

        html += `
            <div class="alert alert-danger">
                ⚠️ Tienes ${overdue} tarea(s) vencida(s)
            </div>
        `;

    }

    if (dueToday > 0) {

        html += `
            <div class="alert alert-warning">
                ⏰ Tienes ${dueToday} tarea(s) que vencen hoy
            </div>
        `;

    }

    container.innerHTML = html;
}

/* =========================
   AGREGAR / EDITAR
========================= */

addTaskBtn.addEventListener(
    "click",
    saveOrUpdateTask
);

taskInput.addEventListener(
    "keydown",
    (e) => {
        if (e.key === "Enter") {
            saveOrUpdateTask();
        }
    }
);
searchTask.addEventListener(
    "input",
    renderTasks
);

filterTasks.addEventListener(
    "change",
    renderTasks
);

function saveOrUpdateTask() {

    const text =
        taskInput.value.trim();

    const date =
        taskDate.value;

    const priority =
        taskPriority.value;
        
    const category =
    taskCategory.value;

    if (!text) return;

    if (editingId !== null) {

        const task =
            allTasks.find(
                t => t.id === editingId
            );

        if (task) {
            task.text = text;
            task.date = date;
            task.priority = priority;
            task.category = category;
        }

        editingId = null;
        addTaskBtn.textContent =
            "Agregar";

    } else {

        allTasks.push({
    id: Date.now(),
    text,
    date,
    priority,
    category,
    completed: false,
    owner: user
});

    }

    taskInput.value = "";
    taskDate.value = "";
    taskPriority.value = "Media";
    taskCategory.value = "Personal";

    saveTasks();
    renderTasks();
    renderAlerts();
    renderCalendar();
}

/* =========================
   RENDER TAREAS
========================= */

function renderTasks() {

    let userTasks = getUserTasks();

    const search = searchTask.value.toLowerCase().trim();
    const filter = filterTasks.value;

    // búsqueda
    if (search) {
        userTasks = userTasks.filter(task =>
            task.text.toLowerCase().includes(search)
        );
    }

    // filtros base
    if (filter === "pending") {
        userTasks = userTasks.filter(task => !task.completed);
    }

    if (filter === "completed") {
        userTasks = userTasks.filter(task => task.completed);
    }

    // filtro por categoría
    if (
        filter === "Personal" ||
        filter === "Trabajo" ||
        filter === "Estudio" ||
        filter === "Salud"
    ) {
        userTasks = userTasks.filter(task => task.category === filter);
    }

    // filtro por prioridad
    if (
        filter === "Alta" ||
        filter === "Media" ||
        filter === "Baja"
    ) {
        userTasks = userTasks.filter(task => task.priority === filter);
    }

    taskList.innerHTML = "";

    document.getElementById("totalTasks").textContent = userTasks.length;

    const completed = userTasks.filter(t => t.completed).length;
    document.getElementById("completedTasks").textContent = completed;

    const today = new Date().toISOString().split("T")[0];

    const overdue = userTasks.filter(task =>
        !task.completed && task.date && task.date < today
    ).length;

    const dueToday = userTasks.filter(task =>
        !task.completed && task.date === today
    ).length;

    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("todayTasks").textContent = dueToday;

    const total = userTasks.length;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressBar").style.width = percent + "%";

    userTasks.forEach(task => {

        let badgeClass = "priority-medium";

        if (task.priority === "Alta") badgeClass = "priority-high";
        if (task.priority === "Baja") badgeClass = "priority-low";

        const li = document.createElement("li");
        li.className = "list-group-item";

        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">

                <div>

                    <div class="mb-2">

                        <input
                            type="checkbox"
                            ${task.completed ? "checked" : ""}
                            onchange="toggleTask(${task.id})"
                        >

                        <strong style="text-decoration:${task.completed ? "line-through" : "none"}">
                            ${task.text}
                        </strong>

                    </div>

                    <small>
                        📅 ${task.date || "Sin fecha"}
                    </small>

                    <div class="mt-2">
                        <span class="priority-badge ${badgeClass}">
                            ${task.priority}
                        </span>

                        <span class="badge bg-secondary ms-2">
                            ${task.category || "Personal"}
                        </span>
                    </div>

                </div>

                <div class="d-flex gap-2">

                    <button class="btn btn-primary btn-sm" onclick="editTask(${task.id})">
                        Editar
                    </button>

                    <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                        Eliminar
                    </button>

                </div>

            </div>
        `;

        taskList.appendChild(li);
    });
}

/* =========================
   EDITAR
========================= */

function editTask(id) {

    const task =
        allTasks.find(
            t => t.id === id &&
            t.owner === user
        );

    if (!task) return;

    taskInput.value =
        task.text;

    taskDate.value =
        task.date;

    taskPriority.value =
        task.priority;
    
    taskCategory.value =
    task.category || "Personal";

    editingId = id;

    addTaskBtn.textContent =
        "Guardar cambios";
}

window.editTask = editTask;

/* =========================
   COMPLETAR
========================= */

function toggleTask(id) {

    const task =
        allTasks.find(
            t => t.id === id &&
            t.owner === user
        );

    if (!task) return;

    task.completed =
        !task.completed;

    saveTasks();
    renderTasks();
    renderAlerts();
}

window.toggleTask = toggleTask;

/* =========================
   ELIMINAR
========================= */

function deleteTask(id) {

    allTasks =
        allTasks.filter(
            t => !(t.id === id &&
            t.owner === user)
        );

    saveTasks();

    renderTasks();
    renderCalendar();
    renderAlerts();
}

window.deleteTask = deleteTask;

/* =========================
   CALENDARIO
========================= */

function renderCalendar() {

    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("monthTitle");

    if (!grid || !title) return;

    const months = [
        "Enero","Febrero","Marzo",
        "Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre",
        "Octubre","Noviembre","Diciembre"
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    title.textContent = `${months[month]} ${year}`;

    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // espacios vacíos antes del día 1
    for (let i = 0; i < startDay; i++) {
        grid.appendChild(document.createElement("div"));
    }

    const userTasks = getUserTasks();
    const today = new Date().toISOString().split("T")[0];

    for (let day = 1; day <= daysInMonth; day++) {

        const dateStr =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const tasks = userTasks.filter(t => t.date === dateStr);

        let dayClass = "calendar-day";

        const hasTasks = tasks.length > 0;
        const hasOverdue = tasks.some(t => !t.completed && t.date < today);
        const hasToday = tasks.some(t => t.date === today && !t.completed);

        if (hasOverdue) {
            dayClass = "calendar-day overdue";
        } else if (hasToday) {
            dayClass = "calendar-day today";
        } else if (hasTasks) {
            dayClass = "calendar-day has-tasks";
        }

        const cell = document.createElement("div");
        cell.className = dayClass;

        // click rápido para crear tarea en ese día
        cell.addEventListener("click", () => {

    const panel = document.getElementById("dayTasksPanel");
    const list = document.getElementById("dayTasksList");
    const title = document.getElementById("dayTasksTitle");

    const tasks = userTasks.filter(t => t.date === dateStr);

    title.textContent = `Tareas del ${dateStr}`;

    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = "<p>No hay tareas</p>";
    } else {
        tasks.forEach(task => {
            const div = document.createElement("div");
            div.className = "list-group-item";

            div.innerHTML = `
                <strong>${task.text}</strong><br>
                <small>${task.priority} - ${task.category}</small>
            `;

            list.appendChild(div);
        });
    }
    

    panel.classList.remove("hidden");
});
        let html = `<div class="calendar-number">${day}</div>`;

        tasks.forEach(task => {

            let color = "";

            if (task.priority === "Alta") color = "red";
            else if (task.priority === "Media") color = "orange";
            else color = "green";

            html += `
                <div class="calendar-task">
                    <span class="priority-dot" style="background:${color}"></span>
                    ${task.text}
                </div>
            `;
        });

        cell.innerHTML = html;
        grid.appendChild(cell);
    }
}


/* =========================
   CAMBIO DE MES
========================= */

if (prevMonth) {
    prevMonth.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonth) {
    nextMonth.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

/* =========================
   LOGOUT
========================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "taskflowUser"
            );

            window.location.href =
                "index.html";

        }
    );

}

/* =========================
   CAMBIAR CONTRASEÑA
========================= */

document
.getElementById("changePasswordBtn")
.addEventListener(
    "click",
    () => {

        const current =
            document.getElementById("currentPassword").value;

        const newPass =
            document.getElementById("newPassword").value;

        const confirm =
            document.getElementById("confirmPassword").value;

        const msg =
            document.getElementById("passwordMessage");

        let users =
            JSON.parse(
                localStorage.getItem("users")
            ) || [];

        const index =
            users.findIndex(
                u => u.username === user
            );

        if (index === -1) {
            msg.innerHTML =
                "❌ Usuario no encontrado";
            return;
        }

        if (
            users[index].password !== current
        ) {
            msg.innerHTML =
                "❌ Contraseña incorrecta";
            return;
        }

        if (newPass !== confirm) {
            msg.innerHTML =
                "❌ Las contraseñas no coinciden";
            return;
        }

        users[index].password =
            newPass;

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

        msg.innerHTML =
            "✅ Contraseña actualizada";
    }
);
/* =========================
   TEMA OSCURO
========================= */

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.checked = true;

}

themeToggle.addEventListener(
    "change",
    () => {

        if (themeToggle.checked) {

            document.body.classList.add(
                "dark-mode"
            );

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            document.body.classList.remove(
                "dark-mode"
            );

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);

/* =========================
   INICIO
========================= */

renderTasks();
renderCalendar();
renderAlerts();
showSection("tasks");
/* =========================
   SIDEBAR HÍBRIDO (PRO MODE)
========================= */

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const overlay = document.getElementById("sidebarOverlay");

// detectar si es móvil
function isMobile() {
    return window.innerWidth <= 900;
}

// estado inicial según pantalla
function initSidebarState() {
    if (isMobile()) {
        sidebar.classList.remove("active"); // oculto en móvil
        overlay.classList.remove("active");
    } else {
        sidebar.classList.add("active"); // visible en PC
    }
}

function initSidebarState() {
    if (window.innerWidth <= 900) {
        sidebar.classList.remove("collapsed");
        sidebar.classList.remove("active");
    } else {
        sidebar.classList.add("active");
    }
}

initSidebarState();
window.addEventListener("resize", initSidebarState);

// toggle botón hamburguesa
menuToggle.addEventListener("click", () => {

    if (isMobile()) {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    } else {
        // en PC funciona como toggle (tipo Gmail)
        sidebar.classList.toggle("collapsed");
    }

});

const closeDayPanel = document.getElementById("closeDayPanel");
const dayPanel = document.getElementById("dayTasksPanel");

if (closeDayPanel) {
    closeDayPanel.addEventListener("click", () => {
        dayPanel.classList.add("hidden");
    });
}
// cerrar overlay (solo móvil)
overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
});

// cerrar al clicar menú (móvil)
document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        if (isMobile()) {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        }
    });
});

// reajustar al cambiar tamaño pantalla
window.addEventListener("resize", initSidebarState);