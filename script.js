async function addTask() {
    const input = document.getElementById('todoInput');
    const taskText = input.value.trim();
    if (!taskText) return;

    try {
        // 使用相對路徑，避免 localhost vs 127.0.0.1 的問題
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskText })
        });

        if (response.ok) {
            createTaskElement(taskText);
            input.value = "";
        } else {
            console.error("伺服器回應不正常");
        }
    } catch (error) {
        console.error("發生錯誤:", error);
        alert("這行是為了除錯：" + error.message);
    }
}

// 也要記得補上這個，重新整理後才看得到舊資料
window.onload = async () => {
    const response = await fetch('/tasks');
    const tasks = await response.json();
    tasks.forEach(t => createTaskElement(t));
};

// 1. 修改顯示邏輯，增加編輯按鈕
function createTaskElement(text, index) {
    const ul = document.getElementById('todoList');
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${text}</span>
        <div class="btn-group">
            <button class="edit-btn" onclick="editTask(${index}, '${text}')">編輯</button>
            <button class="delete-btn" onclick="deleteTask(${index})">刪除</button>
        </div>
    `;
    ul.appendChild(li);
}

// 2. 呼叫後端刪除資料
async function deleteTask(index) {
    try {
        const response = await fetch(`/tasks/${index}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            location.reload(); // 刪除成功後重新整理頁面，最簡單的同步方式
        }
    } catch (error) {
        console.error("刪除失敗:", error);
    }
}

// 3. 呼叫後端更新資料
async function editTask(index, oldText) {
    // 彈出視窗讓使用者輸入新內容，預設值為舊內容
    const newText = prompt("請輸入新的內容：", oldText);
    
    if (newText === null || newText.trim() === "" || newText === oldText) return;

    try {
        const response = await fetch(`/tasks/${index}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: newText.trim() })
        });
        
        if (response.ok) {
            location.reload(); // 重新整理頁面顯示新內容
        }
    } catch (error) {
        console.error("編輯失敗:", error);
    }
}

// 修改讀取邏輯，把 index 傳進去
window.onload = async () => {
    // 改用 alert，手機一打開有跳出這個視窗就代表代碼更新成功了
    alert("手機連線測試中..."); 

    const response = await fetch('/tasks'); // 留一次就好
    const tasks = await response.json();
    const ul = document.getElementById('todoList');
    ul.innerHTML = ""; 
    tasks.forEach((t, i) => createTaskElement(t, i));
};


