const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS registros (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL,
        discord_id TEXT NOT NULL UNIQUE,
        discord_username TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`)
.then(() => {
    console.log("Tabela registros pronta!");
})
.catch(erro => {
    console.error("Erro ao criar tabela:", erro);
});

app.get("/", (req, res) => {
    res.json({
        status: "online",
        mensagem: "Easy Free API funcionando"
    });
});

app.post("/registrar-ip", async (req, res) => {
    const { ip, discord_id, discord_username } = req.body;

    if (!ip) {
        return res.status(400).json({
            message: "IP não informado"
        });
    }

    if (!discord_id) {
        return res.status(400).json({
            message: "Usuário não identificado"
        });
    }

    try {
        const usuario = await pool.query(
            "SELECT * FROM registros WHERE discord_id = $1",
            [discord_id]
        );

        if (usuario.rows.length > 0) {
            return res.status(400).json({
                message: "Você já possui um IP registrado."
            });
        }

        await pool.query(
            `INSERT INTO registros
            (ip, discord_id, discord_username, data)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [ip, discord_id, discord_username]
        );

        res.json({
            message: "IP registrado com sucesso"
        });

    } catch (erro) {
        console.error(
            "Erro no banco de dados:",
            erro.message,
            erro.detail
        );

        res.status(500).json({
            message: "Erro interno no banco de dados"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("API online na porta " + PORT);
});
