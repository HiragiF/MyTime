const days = ['月', '火', '水', '木', '金'];
let currentEditId = null;
let stream = null;

// ページ起動時の処理
window.onload = () => {
    createTimetable(); // テーブルを作る
    loadAllData();     // 【ここ重要！】保存された時間割を読み込む
    loadTasks();       // 【ここ重要！】保存された提出物を読み込む
    setInterval(updateRealTime, 1000);
    updateRealTime();
};

// テーブルの自動生成
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    const periods = [
        { id: "1-2", start: "09:00", end: "10:50", timeId: "p1" },
        { id: "3-4", start: "11:00", end: "12:50", timeId: "p2" },
        { id: "昼", start: "13:00", end: "13:50", timeId: "p3" },
        { id: "6-7", start: "14:00", end: "15:50", timeId: "p4" },
        { id: "8-9", start: "16:00", end: "17:50", timeId: "p5" }
    ];

    periods.forEach(p => {
        const tr = document.createElement('tr');
        // idを判定しやすいように一新します
        tr.id = `row-${p.timeId}`;
        tr.innerHTML = `<td>${p.id}<br><small>${p.start}</small></td>`;
        days.forEach(d => {
            // idにカンマが含まれるとエラーになりやすいため「-」などに変えるのがコツです
            tr.innerHTML += `<td id="${d}-${p.id}" onclick="handleCellClick('${d}-${p.id}')"></td>`;
        });
        tbody.appendChild(tr);
    });
}

function handleCellClick(id) {
    if (isEditMode) {
        openModal(id); // 編集モードなら時間割編集
    } else {
        // 閲覧モードなら提出物追加（まだ関数を作っていない場合は、一旦アラートなどでテスト）
        alert("閲覧モードです。ここに提出物追加機能を入れます！");
        // openTaskModal(id); // 後でここを有効にする
    }
}
// モード切替
let isEditMode = false;
// パスデータを定数として定義
const PATH_EYE = "M0 10Q10 0 20 10 10 20 0 10m6 0a1 1 0 008 0A1 1 0 006 10";
const PATH_PEN = "M15 2M2 14 1 19 6 18 2 14M2 14 15 2 19 6 6 18M3 15 16 3M5 17 18 5M3.5 18.5 1.5 16.5";

function toggleEditMode() {
    isEditMode = !isEditMode;
    const fab = document.getElementById('mode-toggle-fab');
    const path = document.getElementById('fab-path');
    const table = document.getElementById('timetable');
    
    if (isEditMode) {
        fab.classList.add('active');
        table.classList.add('edit-mode');
        path.setAttribute('d', PATH_PEN); // ペンに書き換え
    } else {
        fab.classList.remove('active');
        table.classList.remove('edit-mode');
        path.setAttribute('d', PATH_EYE); // 目に書き換え
    }
}

// 時計と時限ハイライト
function updateRealTime() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});

    const time = now.getHours() * 100 + now.getMinutes();
    let currentId = "";

    // あなたの新しい時間割に合わせて判定時間を修正
    if (time >= 900 && time < 1050) currentId = "p1";
    else if (time >= 1100 && time < 1250) currentId = "p2";
    else if (time >= 1300 && time < 1350) currentId = "p3";
    else if (time >= 1400 && time < 1550) currentId = "p4";
    else if (time >= 1600 && time < 1750) currentId = "p5";

    // 一旦すべてのハイライトを消す
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('current-period'));

    // 今の時間の行を光らせる
    if (currentId !== "") {
        const row = document.getElementById(`row-${currentId}`);
        if (row) row.classList.add('current-period');
    }
}

// タブ切り替え
// script.js の switchTab 関数を修正
function switchTab(tabId, index) {
    // コンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabId).classList.remove('hidden');

    // ボタンのactiveクラス切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // クリックされたボタンをアクティブに（event.currentTargetが使えない場合に備え、indexで指定）
    document.querySelectorAll('.tab-btn')[index].classList.add('active');

    // ライン（インジケーター）を移動させる
    const indicator = document.getElementById('tab-indicator');
    const moveX = index * 100; // インデックスに応じて0%, 100%移動
    indicator.style.transform = `translateX(${moveX}%)`;
}

// 提出物管理（簡易版）
function addTask() {
    const input = document.getElementById('new-task');
    if (!input.value) return;

    const taskList = document.getElementById('task-list');
    const li = document.createElement('li');
    li.innerHTML = `${input.value} <button onclick="this.parentElement.remove(); saveTasks()">消去</button>`;
    taskList.appendChild(li);
    
    input.value = "";
    saveTasks();
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(li => {
        tasks.push(li.innerText.replace(' 消去', ''));
    });
    localStorage.setItem('physicsTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('physicsTasks') || '[]');
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = ""; // 重複を防ぐために一旦空にする
    savedTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `${task} <button onclick="this.parentElement.remove(); saveTasks()">消去</button>`;
        taskList.appendChild(li);
    });
}

// ポップアップ操作
function openModal(id) {
    currentEditId = id;
    const savedData = JSON.parse(localStorage.getItem('physicsData') || '{}');
    const data = savedData[id] || {};

    document.getElementById('input-name').value = data.name || "";
    document.getElementById('input-room').value = data.room || "";
    document.getElementById('input-moodle').value = data.moodleId || "";
    document.getElementById('input-note').value = data.note || "";
    
    const preview = document.getElementById('photo-preview');
    if (data.image) {
        preview.src = data.image;
        preview.classList.remove('hidden');
    } else {
        preview.classList.add('hidden');
    }

    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('camera-preview').classList.add('hidden');
    document.getElementById('snap-btn').classList.add('hidden');
}

// カメラ処理
async function startCamera() {
    const video = document.getElementById('camera-preview');
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.classList.remove('hidden');
        document.getElementById('snap-btn').classList.remove('hidden');
    } catch (err) { alert("カメラが使えません"); }
}

function takePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('photo-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // 容量削減のため画質0.5
    document.getElementById('photo-preview').src = dataUrl;
    document.getElementById('photo-preview').classList.remove('hidden');
    closeModal(); // 撮影したら一旦閉じる（保存はsaveCellで行う）
    openModal(currentEditId); // 再描画
}

// 保存
function saveCell() {
    const savedData = JSON.parse(localStorage.getItem('physicsData') || '{}');
    savedData[currentEditId] = {
        name: document.getElementById('input-name').value,
        room: document.getElementById('input-room').value,
        moodleId: document.getElementById('input-moodle').value,
        note: document.getElementById('input-note').value,
        image: document.getElementById('photo-preview').src
    };
    localStorage.setItem('physicsData', JSON.stringify(savedData));
    renderCell(currentEditId, savedData[currentEditId]);
    closeModal();
}

function loadAllData() {
    const savedData = JSON.parse(localStorage.getItem('physicsData') || '{}');
    Object.keys(savedData).forEach(id => renderCell(id, savedData[id]));
}

function renderCell(id, data) {
    const element = document.getElementById(id);
    if (!element) return;
    let html = `<strong>${data.name}</strong><br><small>${data.room}</small>`;
    if (data.moodleId) html += `<a href="https://moodle.toho-u.ac.jp/course/view.php?id=${data.moodleId}" class="moodle-link" target="_blank" onclick="event.stopPropagation()">Moodle</a>`;
    if (data.image && data.image.startsWith('data')) html += `<div>🖼️</div>`;
    element.innerHTML = html;
}