let db;
const dbName = "KT3_DB";
const tableName = "tableName";

// --- ЗАДАНИЕ 1 ---
function initDB() {
  const request = indexedDB.open(dbName, 1);

  // при первом создании или изменении версии
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains(tableName)) {
      db.createObjectStore(tableName, { keyPath: "key" });
      console.log("Таблица создана");
    }
  };

  // успешное открытие БД
  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("База данных открыта");
    updateTable();
  };

  // ошибка при открытии
  request.onerror = function (event) {
    console.error("Ошибка IndexedDB:", event.target.error);
  };
}

// --- ЗАДАНИЕ 2 ---
function updateTable() {
  const tbody = document.getElementById("dataTableBody");
  tbody.innerHTML = "";

  const transaction = db.transaction([tableName], "readonly");
  const store = transaction.objectStore(tableName);
  const request = store.openCursor();

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const tr = document.createElement("tr");

      const tdKey = document.createElement("td");
      const tdValue = document.createElement("td");
      const tdUpdate = document.createElement("td");
      const tdDelete = document.createElement("td");

      tdKey.textContent = cursor.key;
      tdValue.textContent = cursor.value.value;
      tdValue.contentEditable = true;

      tdUpdate.innerHTML = `<span class='action' onclick='updateItem("${cursor.key}", this)'>Изменить</span>`;
      tdDelete.innerHTML = `<span class='action' onclick='deleteItem("${cursor.key}")'>Удалить</span>`;

      tr.appendChild(tdKey);
      tr.appendChild(tdValue);
      tr.appendChild(tdUpdate);
      tr.appendChild(tdDelete);

      tbody.appendChild(tr);
      cursor.continue();
    } else if (!tbody.hasChildNodes()) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "База данных пуста";
      td.classList.add("emptyHeader");
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  };
}

// --- ЗАДАНИЕ 3 ---
function saveItem() {
  const key = document.getElementById("keyInput").value.trim();
  const value = document.getElementById("valueInput").value.trim();

  if (!key || !value) {
    alert("Введите ключ и значение!");
    return;
  }

  const transaction = db.transaction([tableName], "readwrite");
  const store = transaction.objectStore(tableName);

  const request = store.add({ key: key, value: value });

  request.onsuccess = function () {
    alert("Запись успешно добавлена");
    updateTable();
  };

  request.onerror = function () {
    alert("Ошибка: возможно, такой ключ уже существует");
  };

  document.getElementById("keyInput").value = "";
  document.getElementById("valueInput").value = "";
}

// --- ЗАДАНИЕ 4 ---
function updateItem(key, element) {
  const newValue = element.parentNode.parentNode.querySelector("td:nth-child(2)").textContent;

  const transaction = db.transaction([tableName], "readwrite");
  const store = transaction.objectStore(tableName);

  const request = store.put({ key: key, value: newValue });

  request.onsuccess = function () {
    alert("Запись успешно изменена");
    updateTable();
  };

  request.onerror = function () {
    alert("Ошибка при изменении записи");
  };
}

// --- ЗАДАНИЕ 5 ---
function deleteItem(key) {
  const transaction = db.transaction([tableName], "readwrite");
  const store = transaction.objectStore(tableName);

  const request = store.delete(key);

  request.onsuccess = function () {
    alert("Запись успешно удалена");
    updateTable();
  };

  request.onerror = function () {
    alert("Ошибка при удалении записи");
  };
}
