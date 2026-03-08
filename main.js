
// Get today's date as YYYY-MM-DD
function getToday() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// Set the "Your progress" date heading
(function () {
  var d = new Date();
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById("today-date").textContent =
    months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
})();

// Load the progress log: { "2026-03-07": 3, "2026-03-06": 2, ... }
function loadLog() {
  var raw = localStorage.getItem("habitsight_progress");
  return raw ? JSON.parse(raw) : {};
}

// Save today's completed count to localStorage and re-render the chart
function saveProgress() {
  var done = document.querySelectorAll(".habit-item.done").length;
  var log = loadLog();
  log[getToday()] = done;
  localStorage.setItem("habitsight_progress", JSON.stringify(log));
  renderBarChart();
}

// ── Habit toggle & remove ─────────────────────
document.getElementById("habit-list").addEventListener("click", function (e) {
  if (e.target.classList.contains("habit-remove")) {
    var item = e.target.closest(".habit-item");
    item.remove();
    updateCount();
    saveProgress();
    return;
  }

  var item = e.target.closest(".habit-item");
  if (!item) return;
  item.classList.toggle("done");
  updateCount();
  saveProgress();
});

function updateCount() {
  var total = document.querySelectorAll(".habit-item").length;
  var done = document.querySelectorAll(".habit-item.done").length;
  document.getElementById("count-badge").textContent = done + " / " + total;
}

// ── Add habit modal ───────────────────────────
function openHabitModal() {
  document.getElementById("habit-modal").classList.add("open");
  document.getElementById("habit-input").focus();
}

function closeHabitModal() {
  document.getElementById("habit-modal").classList.remove("open");
  document.getElementById("habit-input").value = "";
}

function addHabit() {
  var input = document.getElementById("habit-input");
  var text = input.value.trim();
  if (!text) return;

  var li = document.createElement("li");
  li.className = "habit-item";
  li.innerHTML =
    '<div class="habit-checkbox">' +
    '<svg viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="2,8 6,12 14,4"/>' +
    "</svg>" +
    "</div>" +
    '<span class="habit-label">' +
    text +
    "</span>" +
    '<button class="habit-remove" title="Remove habit">✕</button>';

  document.getElementById("habit-list").appendChild(li);
  updateCount();
  closeHabitModal();
}

document.getElementById("habit-modal").addEventListener("click", function (e) {
  if (e.target === this) closeHabitModal();
});

document
  .getElementById("habit-input")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") addHabit();
  });

// ── Bar chart ─────────────────────────────────

// Get last 7 days as array of { label, date }
function getLast7Days() {
  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var result = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var dateStr = d.getFullYear() + "-" + month + "-" + day;
    result.push({ label: dayNames[d.getDay()], date: dateStr });
  }
  return result;
}

function renderBarChart() {
  var log = loadLog();
  var last7 = getLast7Days();

  // max is always 5 — each habit completed = 20%
  var max = 5;

  // clear and rebuild bars
  var chart = document.getElementById("bar-chart");
  chart.innerHTML = "";

  var labelEls = document.querySelectorAll(".bar-labels span");

  for (var i = 0; i < last7.length; i++) {
    var count = log[last7[i].date] || 0;
    // cap at 5 so it never overflows
    if (count > max) count = max;
    var heightPct = (count / max) * 100;

    var col = document.createElement("div");
    col.className = "bar-col";
    col.title =
      last7[i].label +
      ": " +
      count +
      " habit" +
      (count !== 1 ? "s" : "") +
      " completed";

    var empty = document.createElement("div");
    empty.className = "bar-empty";

    var fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.height = heightPct + "%";
    if (count === 0) fill.style.opacity = "0";

    col.appendChild(empty);
    col.appendChild(fill);
    chart.appendChild(col);

    if (labelEls[i]) {
      labelEls[i].textContent = last7[i].label;
    }
  }
}

// draw chart on load
renderBarChart();

// ── Custom Streak Calendar ────────────────────
var calendarDate = new Date(2026, 2, 1); // March 2026
var streakDates = {
  "2026-03-01": true,
  "2026-03-02": true,
  "2026-03-03": true,
  "2026-03-04": true,
  "2026-03-05": false,
  "2026-03-06": true,
  "2026-03-07": true,
};

var MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(y, m, d) {
  return (
    y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0")
  );
}

function renderCalendar() {
  var el = document.getElementById("streak-calendar");
  var year = calendarDate.getFullYear();
  var month = calendarDate.getMonth();

  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var todayStr = getToday();

  var html =
    '<div class="cal-nav">' +
    '<button class="cal-prev" onclick="calPrev()">&#8249;</button>' +
    '<span class="cal-title">' +
    MONTH_NAMES[month] +
    " " +
    year +
    "</span>" +
    '<button class="cal-next" onclick="calNext()">&#8250;</button>' +
    "</div>" +
    '<div class="cal-grid">';

  // day headers
  for (var i = 0; i < 7; i++) {
    html += '<div class="cal-day-name">' + DAY_NAMES[i] + "</div>";
  }

  // empty cells before first day
  for (var i = 0; i < firstDay; i++) {
    html += '<div class="cal-day cal-empty"></div>';
  }

  // day cells
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = toDateStr(year, month, d);
    var classes = "cal-day";
    if (streakDates[dateStr]) classes += " streak";
    if (dateStr === todayStr) classes += " today";
    html +=
      '<div class="' +
      classes +
      '" onclick="toggleStreak(\'' +
      dateStr +
      "')\">" +
      d +
      "</div>";
  }

  html += "</div>";
  el.innerHTML = html;
}

function calPrev() {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
}

function calNext() {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
}

function toggleStreak(dateStr) {
  if (streakDates[dateStr]) {
    delete streakDates[dateStr];
  } else {
    streakDates[dateStr] = true;
  }
  renderCalendar();
}

renderCalendar();

// ── Dark mode ─────────────────────────────────
var isDark = localStorage.getItem("habitsight_dark") === "true";

if (isDark) {
  document.body.classList.add("dark");
  document.getElementById("dark-toggle-input").checked = true;
}

function toggleDarkMode(checked) {
  isDark = checked;
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("habitsight_dark", isDark);
}

// ── Journal ───────────────────────────────────
var journalEntries = JSON.parse(
  localStorage.getItem("habitsight_journal") || "[]",
);
var editingId = null;

function saveJournal() {
  localStorage.setItem("habitsight_journal", JSON.stringify(journalEntries));
}

function getDateString() {
  var d = new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function openNewEntry() {
  editingId = null;
  document.getElementById("journal-title-input").value = "";
  document.getElementById("journal-textarea").value = "";
  document.getElementById("journal-editor").classList.remove("hidden");
  document.getElementById("journal-title-input").focus();
}

function cancelEntry() {
  editingId = null;
  document.getElementById("journal-editor").classList.add("hidden");
  document.getElementById("journal-title-input").value = "";
  document.getElementById("journal-textarea").value = "";
}

function saveEntry() {
  var title = document.getElementById("journal-title-input").value.trim();
  var body = document.getElementById("journal-textarea").value.trim();
  if (!title && !body) return;

  if (editingId !== null) {
    // find and update existing entry
    for (var i = 0; i < journalEntries.length; i++) {
      if (journalEntries[i].id === editingId) {
        journalEntries[i].title = title || "Untitled";
        journalEntries[i].body = body;
        break;
      }
    }
  } else {
    // new entry
    var entry = {
      id: Date.now(),
      title: title || "Untitled",
      body: body,
      date: getDateString(),
    };
    journalEntries.unshift(entry);
  }

  editingId = null;
  saveJournal();
  cancelEntry();
  renderJournal();
}

function editEntry(id) {
  for (var i = 0; i < journalEntries.length; i++) {
    if (journalEntries[i].id === id) {
      editingId = id;
      document.getElementById("journal-title-input").value =
        journalEntries[i].title;
      document.getElementById("journal-textarea").value =
        journalEntries[i].body;
      document.getElementById("journal-editor").classList.remove("hidden");
      document.getElementById("journal-title-input").focus();
      break;
    }
  }
}

function deleteEntry(id) {
  journalEntries = journalEntries.filter(function (e) {
    return e.id !== id;
  });
  saveJournal();
  renderJournal();
}

function renderJournal() {
  var list = document.getElementById("journal-list");
  var empty = document.getElementById("journal-empty");

  list.innerHTML = "";

  if (journalEntries.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  for (var i = 0; i < journalEntries.length; i++) {
    var e = journalEntries[i];

    var el = document.createElement("div");
    el.className = "journal-entry";
    el.innerHTML =
      '<div class="entry-header">' +
      '<span class="entry-title">' +
      e.title +
      "</span>" +
      '<span class="entry-date">' +
      e.date +
      "</span>" +
      "</div>" +
      '<p class="entry-body">' +
      e.body +
      "</p>" +
      '<div class="entry-actions">' +
      '<button class="btn-edit-entry" onclick="editEntry(' +
      e.id +
      ')">Edit</button>' +
      '<button class="btn-delete-entry" onclick="deleteEntry(' +
      e.id +
      ')">Delete</button>' +
      "</div>";

    list.appendChild(el);
  }
}

// render journal on load
renderJournal();

var users = [];

function setLoggedIn(name) {
  document.getElementById("nav-auth").classList.add("hidden");
  document.getElementById("nav-profile").classList.remove("hidden");
  document.getElementById("profile-name").textContent = name;
}

function toggleProfileMenu() {
  var dropdown = document.getElementById("profile-dropdown");
  dropdown.classList.toggle("hidden");
}

function handleLogout() {
  document.getElementById("nav-profile").classList.add("hidden");
  document.getElementById("nav-auth").classList.remove("hidden");
  document.getElementById("profile-dropdown").classList.add("hidden");
}

// close dropdown when clicking outside
document.addEventListener("click", function (e) {
  var profile = document.getElementById("nav-profile");
  var dropdown = document.getElementById("profile-dropdown");
  if (profile && !profile.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// ── Login ─────────────────────────────────────
function openLoginModal() {
  document.getElementById("login-modal").classList.add("open");
  document.getElementById("login-error").classList.add("hidden");
}

function closeLoginModal() {
  document.getElementById("login-modal").classList.remove("open");
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("login-error").classList.add("hidden");
}

function handleLogin() {
  var email = document.getElementById("login-email").value.trim();
  var password = document.getElementById("login-password").value;
  var error = document.getElementById("login-error");

  var found = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      found = users[i];
      break;
    }
  }

  if (!found) {
    error.classList.remove("hidden");
    return;
  }

  closeLoginModal();
  setLoggedIn(found.name);
}

document.getElementById("login-modal").addEventListener("click", function (e) {
  if (e.target === this) closeLoginModal();
});

// ── Sign up ───────────────────────────────────
function openSignupModal() {
  document.getElementById("signup-modal").classList.add("open");
  document.getElementById("signup-error").classList.add("hidden");
}

function closeSignupModal() {
  document.getElementById("signup-modal").classList.remove("open");
  document.getElementById("signup-name").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
  document.getElementById("signup-error").classList.add("hidden");
}

function handleSignup() {
  var name = document.getElementById("signup-name").value.trim();
  var email = document.getElementById("signup-email").value.trim();
  var password = document.getElementById("signup-password").value;
  var error = document.getElementById("signup-error");

  if (!name || !email || !password) {
    error.textContent = "Please fill in all fields.";
    error.classList.remove("hidden");
    return;
  }

  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      error.textContent = "An account with this email already exists.";
      error.classList.remove("hidden");
      return;
    }
  }

  users.push({ name: name, email: email, password: password });
  closeSignupModal();
  setLoggedIn(name);
}

document.getElementById("signup-modal").addEventListener("click", function (e) {
  if (e.target === this) closeSignupModal();
});

// ── Switch modals ─────────────────────────────
function switchToSignup() {
  closeLoginModal();
  openSignupModal();
  return false;
}

function switchToLogin() {
  closeSignupModal();
  openLoginModal();
  return false;
}
