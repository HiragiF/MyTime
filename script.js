const days = ['月', '火', '水', '木', '金'];
let currentEditId = null;
let stream = null;

// ページ起動時の処理
window.onload = () => {
    createTimetable();
    loadAllData();
    setInterval(updateRealTime, 1000);
    updateRealTime();
};

// テーブルの自動生成
function createTimetable() {
    const tbody = document.getElementById('timetable-body');
    const periods = [
        { id: 1, start: "08:50", end: "10:30" },
        { id: 2, start: "10:40", end: "12:20" },
        { id: 3, start: "13:10", end: "14:50" },
        { id: 4, start: "15:00", end: "16:40" },
        { id: 5, start: "16:50", end: "18:30" }
    ];

    periods.forEach(p => {
        const tr = document.createElement('tr');
        tr.id = `row-period-${p.id}`;
        tr.innerHTML = `<td>${p.id}<br><small>${p.start}</small></td>`;
        days.forEach(d => {
            tr.innerHTML += `<td id="${d}${p.id}" onclick="openModal('${d}${p.id}')"></td>`;
        });
        tbody.appendChild(tr);
    });
}

// 時計と時限ハイライト
function updateRealTime() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();

    const time = now.getHours() * 100 + now.getMinutes();
    let currentP = 0;
    if (time >= 850 && time < 1030) currentP = 1;
    else if (time >= 1040 && time < 1220) currentP = 2;
    else if (time >= 1310 && time < 1450) currentP = 3;
    else if (time >= 1500 && time < 1640) currentP = 4;
    else if (time >= 1650 && time < 1830) currentP = 5;

    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('current-period'));
    if (currentP > 0) {
        const row = document.getElementById(`row-period-${currentP}`);
        if (row) row.classList.add('current-period');
    }
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