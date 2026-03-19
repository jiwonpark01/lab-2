const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'testuser',
    password: '1234',
    database: 'testdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/news/list', async (req, res) => {
    try {
        const sql = `
            SELECT
                id,
                title,
                category,
                content,
                author
            FROM news
            ORDER BY id DESC
        `;

        const [rows] = await pool.execute(sql);

        res.json(rows);

    } catch (error) {
        console.error('조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 목록 조회 중 오류가 발생했습니다.'
        });
    }
});

app.post('/news/create', async (req, res) => {
    try {
        const {
            title,
            category,
            content,
            author
        } = req.body;

        const sql = `
            INSERT INTO news (
                title,
                category,
                content,
                author
            )
            VALUES (?, ?, ?, ?)
        `;

        await pool.execute(sql, [
            title,
            category,
            content,
            author
        ]);

        res.json({
            success: true,
            message: '뉴스가 정상적으로 등록되었습니다.'
        });
    } catch (error) {
        console.error('등록 실패:', error);
        res.status(500).json({
            success: false,
            message: '뉴스 등록 중 오류가 발생했습니다.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`조회 프로젝트 실행: http://localhost:${PORT}`);
});