const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
const periods = 5;
const moodleBase = "https://moodle.toho-u.ac.jp/course/view.php?id=";

// 1. 初期化
window.onload = () => {
    buildTimetable();
    loadData();
    setInterval(updateHighlight, 60000); // 1分ごとにハイライト更新
    updateHighlight();
};

// 2. テーブル生成
function buildTimetable() {
    const tbody = document.getElementById('timetable-body');
    for (let i = 1; i <= periods; i++) {
        const tr = document.createElement('tr');
        tr.id = `row-period-${i}`;
        tr.innerHTML = `<th>${i}</th>` + days.map(day => `
            <td onclick="editCell('${day}${i}')">
                <div id="${day}${i}" class="cell-content"></div>
            </td>
        `).join('');
        tbody.appendChild(tr);
    }
}

// 3. 編集機能
function editCell(id) {
    const element = document.getElementById(id);
    const savedData = JSON.parse(localStorage.getItem('physicsData') || '{}');
    const current = savedData[id] || { name: "", moodleId: "" };

    const newName = prompt("授業名と教室", current.name);
    if (newName === null) return;

    const newMoodleId = prompt("MoodleのコースID(数字のみ)", current.moodleId);
    
    savedData[id] = { name: newName, moodleId: newMoodleId };
    localStorage.setItem('physicsData', JSON.stringify(savedData));
    renderCell(id, savedData[id]);
}

function renderCell(id, data) {
    const element = document.getElementById(id);
    if (!data.name) {
        element.innerHTML = "";
        return;
    }
    let html = `<div>${data.name}</div>`;
    if (data.moodleId) {
        html += `<a href="${moodleBase}${data.moodleId}" class="moodle-link" onclick="event.stopPropagation()">Moodle</a>`;
    }
    element.innerHTML = html;
}

// 4. データ読み込み
function loadData() {
    const savedData = JSON.parse(localStorage.getItem('physicsData') || '{}');
    Object.keys(savedData).forEach(id => renderCell(id, savedData[id]));

    const savedMemo = localStorage.getItem('physicsMemo');
    if (savedMemo) document.getElementById('quick-memo').value = savedMemo;
}

// 5. ハイライト機能 (東邦大学の時間割例: 9:00〜10:30等に合わせて調整)
function updateHighlight() {
    const now = new Date();
    const hm = now.getHours() * 100 + now.getMinutes();
    
    // 全行のハイライトを一旦消す
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('current-period'));

    let currentP = 0;
    if (hm >= 900 && hm < 1030) currentP = 1;
    else if (hm >= 1040 && hm < 1210) currentP = 2;
    else if (hm >= 1300 && hm < 1430) currentP = 3;
    else if (hm >= 1440 && hm < 1610) currentP = 4;
    else if (hm >= 1620 && hm < 1750) currentP = 5;

    if (currentP > 0) {
        const row = document.getElementById(`row-period-${currentP}`);
        if (row) row.classList.add('current-period');
    }
    
    document.getElementById('current-time').innerText = now.toLocaleTimeString();
}

// メモ保存
document.getElementById('quick-memo').addEventListener('input', (e) => {
    localStorage.setItem('physicsMemo', e.target.value);
});

// 画像プレビュー (簡易版)
document.getElementById('image-input').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        preview.appendChild(img);
        // ※IndexedDBへの保存は次ステップで実装
    }
    reader.readAsDataURL(e.target.files[0]);
});