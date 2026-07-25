const express = require("express");

const app = express();

app.use(express.json());

const registros = [];

app.get("/", (req, res) => {
    res.json({
        status: "online",
        mensagem: "Easy Free API funcionando"
    });
});

app.post("/registrar-ip", (req, res) => {
    const { ip, discord_id, discord_username } = req.body;

    if (!ip) {
        return res.status(400).json({
            message: "IP não informado"
        });
    }

    registros.push({
        ip,
        discord_id,
        discord_username,
        data: new Date()
    });

    res.json({
        message: "IP registrado com sucesso"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("API online na porta " + PORT);
});
