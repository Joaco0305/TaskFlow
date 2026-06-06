const user = localStorage.getItem("taskflowUser");

if (!user) {
    window.location.href = "index.html";
}

document.getElementById("welcomeUser").textContent =
    user;

document.getElementById("settingsUser").textContent =
    user;

/* =========================
   DATOS
========================= */

let allTasks =
    JSON.parse(localStorage.getItem(`${user}-tasks`)) || [];

let editingId = null;
let modalEditingId = null;

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
function showToast(message,type = "success"){

    const container =
    document.getElementById("toastContainer");

    if(!container) return;

    const toast =
    document.createElement("div");

    toast.className =
    `custom-toast ${type}`;

    toast.textContent =
    message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    },100);

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        },300);

    },3000);

}

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
            showToast("✏️ Tarea actualizada correctamente","info");

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
showToast("✅ Tarea creada correctamente","success");

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
        const heroGreeting =
document.getElementById(
    "heroGreeting"
);

const heroSubtitle =
document.getElementById(
    "heroSubtitle"
);

if(heroGreeting && heroSubtitle){

    const hour =
    new Date().getHours();

    let greeting = "Hola";

    if(hour < 12){
        greeting = "☀️ Buenos días";
    }
    else if(hour < 19){
        greeting = "🌤️ Buenas tardes";
    }
    else{
        greeting = "🌙 Buenas noches";
    }

    heroGreeting.textContent =
    `${greeting}, ${user}`;

    const pending =
    userTasks.filter(
        t => !t.completed
    ).length;

    if(pending === 0){

        heroSubtitle.textContent =
        "🎉 No tienes tareas pendientes. Todo está al día.";

    }

    else if(dueToday > 0){

        heroSubtitle.textContent =
        `Tienes ${pending} tareas pendientes y ${dueToday} vencen hoy.`;

    }

    else{

        heroSubtitle.textContent =
        `Tienes ${pending} tareas pendientes. Sigue avanzando 🚀`;

    }

}

    document.getElementById("progressPercent").textContent = percent + "%";
    document.getElementById("progressBar").style.width = percent + "%";
    const sidebarCompletedTasks =
document.getElementById("sidebarCompletedTasks");

const sidebarProductivity =
document.getElementById("sidebarProductivity");

const sidebarStreak =
document.getElementById("sidebarStreak");

if(sidebarCompletedTasks){
    sidebarCompletedTasks.textContent =
    completed;
}

if(sidebarProductivity){
    sidebarProductivity.textContent =
    percent + "%";
}

if(sidebarStreak){

    const completedWithDate =
    getUserTasks()
    .filter(task => task.completed && task.date)
    .map(task => task.date);

    const uniqueDates =
    [...new Set(completedWithDate)]
    .sort()
    .reverse();

    let streak = 0;

    let checkingDate =
    new Date();

    while(true){

        const dateString =
        checkingDate
        .toISOString()
        .split("T")[0];

        if(uniqueDates.includes(dateString)){

            streak++;

            checkingDate.setDate(
                checkingDate.getDate() - 1
            );

        } else {

            break;

        }

    }

    sidebarStreak.textContent =
    streak + " días";

}

    userTasks.forEach(task => {

        let badgeClass = "priority-medium";

if(task.priority === "Alta"){
    badgeClass = "priority-high";
}

if(task.priority === "Baja"){
    badgeClass = "priority-low";
}

let categoryClass = "category-personal";
let categoryIcon = "👤";

if(task.category === "Trabajo"){
    categoryClass = "category-work";
    categoryIcon = "💼";
}

if(task.category === "Estudio"){
    categoryClass = "category-study";
    categoryIcon = "📚";
}

if(task.category === "Salud"){
    categoryClass = "category-health";
    categoryIcon = "❤️";
}

        const li = document.createElement("li");
        li.className = "list-group-item";

         li.innerHTML = `

         <div class="task-premium-item ${task.completed ? "task-done" : ""}">

         <button
            class="task-check-btn ${task.completed ? "checked" : ""}"
            onclick="toggleTask(${task.id})">
            ${task.completed ? "✓" : ""}
         </button>

            <div class="task-premium-info">

            <div class="task-title-row">

    <h4>
        ${task.text}
    </h4>

    ${
        task.completed
        ? `<span class="completed-pill">Completada</span>`
        : ""
    }

</div>

            <div class="task-premium-meta">

                <span class="date-pill">
    📅 ${task.date || "Sin fecha"}
</span>

                <span class="priority-badge ${badgeClass}">

                 <span class="pill-dot"></span>

                    ${task.priority}

                </span>

             <span class="task-category-pill ${categoryClass}">
    ${categoryIcon} ${task.category || "Personal"}
</span>

            </div>

        </div>

        <div class="task-premium-actions">

            <button
                class="edit-premium-btn"
                onclick="editTask(${task.id})"
            >
                ✏️ Editar
            </button>

            <button
                class="delete-premium-btn"
                onclick="deleteTask(${task.id})"
            >
                🗑️ Eliminar
            </button>

        </div>

    </div>

 `;

        taskList.appendChild(li);
    });
    const emptyState =
document.getElementById("emptyState");

if(emptyState){

    if(userTasks.length === 0){
        emptyState.style.display = "flex";
    } else {
        emptyState.style.display = "none";
    }

} 
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

    modalEditingId = id;

    document.getElementById("editTaskInput").value =
        task.text;

    document.getElementById("editTaskDate").value =
        task.date;

    document.getElementById("editTaskPriority").value =
        task.priority;

    document.getElementById("editTaskCategory").value =
        task.category || "Personal";

    document
    .getElementById("editTaskModal")
    .classList
    .remove("hidden");

}

window.editTask = editTask;
function closeEditModal(){

    modalEditingId = null;

    document
    .getElementById("editTaskModal")
    .classList
    .add("hidden");

}

window.closeEditModal =
closeEditModal;

function saveEditModal(){

    if(modalEditingId === null){
        return;
    }

    const task =
    allTasks.find(
        t => t.id === modalEditingId &&
        t.owner === user
    );

    if(!task){
        return;
    }

    const newText =
    document
    .getElementById("editTaskInput")
    .value
    .trim();

    if(!newText){
        alert("La tarea no puede estar vacía");
        return;
    }

    task.text =
    newText;

    task.date =
    document.getElementById("editTaskDate").value;

    task.priority =
    document.getElementById("editTaskPriority").value;

    task.category =
    document.getElementById("editTaskCategory").value;

    saveTasks();
    renderTasks();
    renderCalendar();
    renderAlerts();

    closeEditModal();

    showToast(
        "✏️ Tarea actualizada correctamente",
        "info"
    );

}

window.saveEditModal =
saveEditModal;

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
        if(task.completed){
    showToast("🎉 Tarea completada","success");
} else {
    showToast("↩️ Tarea marcada como pendiente","info");
}

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
    
    showToast("🗑️ Tarea eliminada","danger");
    saveTasks();

    renderTasks();
    renderCalendar();
    renderAlerts();
}

window.deleteTask = deleteTask;
function deleteTaskFromCalendar(id){

    const confirmDelete =
    confirm("¿Eliminar esta tarea?");

    if(!confirmDelete){
        return;
    }

    allTasks =
    allTasks.filter(
        task => !(task.id === id && task.owner === user)
    );
    showToast("🗑️ Tarea eliminada","danger");
    saveTasks();
    renderTasks();
    renderCalendar();
    renderAlerts();

    const panel =
    document.getElementById("dayTasksPanel");

    if(panel){
        panel.classList.add("hidden");
    }

}

window.deleteTaskFromCalendar =
deleteTaskFromCalendar;

/* =========================
   CALENDARIO
========================= */

function renderCalendar() {

    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("monthTitle");

    if (!grid || !title) return;

    const months = [
        "Enero", "Febrero", "Marzo",
        "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre",
        "Octubre", "Noviembre", "Diciembre"
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    title.textContent = `${months[month]} ${year}`;

    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
        grid.appendChild(document.createElement("div"));
    }

    const userTasks = getUserTasks();

    const today =
        new Date()
        .toISOString()
        .split("T")[0];

    for (let day = 1; day <= daysInMonth; day++) {

        const dateStr =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const tasks =
            userTasks.filter(
                task => task.date === dateStr
            );

        const cell =
            document.createElement("div");

        cell.className = "calendar-day";

        if (tasks.length > 0) {
            cell.classList.add("has-tasks");
        }

        if (dateStr === today) {
            cell.classList.add("current-day");
        }

        const hasOverdue =
            tasks.some(
                task => !task.completed && task.date < today
            );

        const hasToday =
            tasks.some(
                task => !task.completed && task.date === today
            );

        if (hasOverdue) {
            cell.classList.add("overdue");
        }

        if (hasToday) {
            cell.classList.add("today");
        }

        let html =
            `<div class="calendar-number">${day}</div>`;

        if (tasks.length > 0) {

            html += `<div class="calendar-dots">`;

            tasks.slice(0, 3).forEach(task => {

                let dotClass = "dot-medium";

                if (task.priority === "Alta") {
                    dotClass = "dot-high";
                }

                if (task.priority === "Baja") {
                    dotClass = "dot-low";
                }

                html += `
                    <span class="calendar-dot ${dotClass}"></span>
                `;

            });

            if (tasks.length > 3) {
                html += `
                    <span class="more-tasks">
                        +${tasks.length - 3}
                    </span>
                `;
            }

            html += `</div>`;
        }

        cell.innerHTML = html;

        cell.addEventListener("click", () => {

            const panel =
                document.getElementById("dayTasksPanel");

            const list =
                document.getElementById("dayTasksList");

            const title =
                document.getElementById("dayTasksTitle");

            const prettyDate =
                new Date(dateStr + "T00:00:00")
                .toLocaleDateString(
                    "es-ES",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                    }
                );

            title.textContent =
                `📅 ${prettyDate}`;

            list.innerHTML = "";

            if (tasks.length === 0) {

                list.innerHTML =
                    "<p>No hay tareas para este día</p>";

            } else {

                tasks.forEach(task => {

                    let priorityClass =
                        "modal-priority-medium";

                    let priorityText =
                        "🟡 Media";

                    if (task.priority === "Alta") {
                        priorityClass =
                            "modal-priority-high";

                        priorityText =
                            "🔴 Alta";
                    }

                    if (task.priority === "Baja") {
                        priorityClass =
                            "modal-priority-low";

                        priorityText =
                            "🟢 Baja";
                    }

                    const div =
                        document.createElement("div");

                    div.className =
                        "calendar-modal-task-item";

                    div.innerHTML = `
    <div class="calendar-modal-task-info">

        <strong>
            ${task.text}
        </strong>

        <span class="${priorityClass}">
            ${priorityText}
        </span>

    </div>

    <button
        class="calendar-delete-btn"
        onclick="deleteTaskFromCalendar(${task.id})"
    >
        🗑️
    </button>
`;

                    list.appendChild(div);

                });

            }

            panel.classList.remove("hidden");

        });

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
   TEMA CLARO / OSCURO
========================= */

const savedTheme =
localStorage.getItem("theme") || "dark";

if(savedTheme === "dark"){

    document.body.classList.add("dark-mode");
    themeToggle.checked = true;

} else {

    document.body.classList.remove("dark-mode");
    themeToggle.checked = false;

}

themeToggle.addEventListener("change", () => {

    if(themeToggle.checked){

        document.body.classList.add("dark-mode");

        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        document.body.classList.remove("dark-mode");

        localStorage.setItem(
            "theme",
            "light"
        );

    }

});
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
function updateHeroHeader(){

    const greeting =
    document.getElementById(
        "heroGreeting"
    );

    const currentDate =
    document.getElementById(
        "currentDate"
    );

    const currentDay =
    document.getElementById(
        "currentDay"
    );

    if(!greeting) return;

    const hour =
    new Date().getHours();

    let text =
    "Buenos días";

    if(hour >= 12){
        text =
        "Buenas tardes";
    }

    if(hour >= 19){
        text =
        "Buenas noches";
    }

    greeting.textContent =
    `${text}, ${user} 👋`;

    const now =
    new Date();

    currentDate.textContent =
    now.toLocaleDateString(
        "es-ES",
        {
            day:"numeric",
            month:"long",
            year:"numeric"
        }
    );

    currentDay.textContent =
    now.toLocaleDateString(
        "es-ES",
        {
            weekday:"long"
        }
    );

}

updateHeroHeader();