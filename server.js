require('dotenv').config(); // 1. 載入 dotenv

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // 換成 mongoose
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

// 引入路徑工具
const path = require('path');

// 強制讓首頁請求導向到 index.html
app.get('/', (req, res) => {
    // 這裡會自動去找 Public 資料夾下的 index.html
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// 1. 連接雲端資料庫
const MONGODB_URI = process.env.MONGODB_URI;

// 連線逾時
const connectionOptions = {
    serverSelectionTimeoutMS: 10000, // 增加到 10 秒，給網路更多時間反應
    socketTimeoutMS: 45000,
};

// 傳入 URI 和設定
mongoose.connect(MONGODB_URI, connectionOptions)
    .then(() => console.log("✅ 雲端資料庫連線成功！"))
    .catch(err => {
        console.error("❌ 連線失敗：", err.message);
        console.log("💡 小提醒：如果持續失敗，請嘗試切換手機熱點測試 DNS 解析。");
    });

// 2. 定義資料結構 (Schema)
const TaskSchema = new mongoose.Schema({
    content: String
});
const Task = mongoose.model('Task', TaskSchema);

// 3. 修改 API 接口 (全部改為 async/await)
// 讀取所有任務
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        // 轉換格式以對應你原本的前端
        res.json(tasks.map(t => t.content));
    } catch (err) {
        res.status(500).json({ error: "讀取失敗" });
    }
});

// 新增任務
app.post('/tasks', async (req, res) => {
    try {
        const newTask = new Task({ content: req.body.task });
        await newTask.save();
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: "新增失敗" });
    }
});

// 刪除任務
app.delete('/tasks/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const tasks = await Task.find(); // 拿到所有資料
        if (tasks[index]) {
            await Task.findByIdAndDelete(tasks[index]._id); // 透過資料 ID 刪除
            res.json({ status: "ok" });
        } else {
            res.status(404).json({ error: "找不到項目" });
        }
    } catch (err) {
        res.status(500).json({ error: "刪除失敗" });
    }
});

// 編輯任務
app.put('/tasks/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const newTaskContent = req.body.task;
        const tasks = await Task.find();
        if (tasks[index]) {
            await Task.findByIdAndUpdate(tasks[index]._id, { content: newTaskContent });
            res.json({ status: "ok" });
        } else {
            res.status(404).json({ error: "找不到項目" });
        }
    } catch (err) {
        res.status(500).json({ error: "更新失敗" });
    }
});

// 電腦 AI 邏輯：尋找最佳移動
app.post('/ttt-move', (req, res) => {
    const board = req.body.board; // 接收前端傳來的 [ "O", "", "X" ... ]

    // 簡單的 AI：先找有沒有空格可以下 (這裡可以實作更強的 Minimax)
    const availableMoves = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    
    // 如果還有空位，隨機選一個（或寫入贏球邏輯）
    if (availableMoves.length > 0) {
        // 這裡我們模擬 AI 思考，回傳索引值
        const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        res.json({ index: randomIndex });
    } else {
        res.json({ index: -1 });
    }
});

app.listen(3000, () => console.log('🚀 伺服器跑在 http://localhost:3000'));
