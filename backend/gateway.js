import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 3000;

const REPLICAS = [
  "http://localhost:3001",
  "http://localhost:3002",
];

let proximo = 0;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/health", async (req, res) => {
  const status = await Promise.all(
    REPLICAS.map(async (url) => {
      try {
        const r = await fetch(`${url}/health`);
        const data = await r.json();
        return { replica: url, status: "no ar", nome: data.servedBy };
      } catch {
        return { replica: url, status: "FORA DO AR" };
      }
    })
  );
  res.json(status);
});

app.post("/create-preference", async (req, res) => {
  const ordem = [];
  for (let i = 0; i < REPLICAS.length; i++) {
    ordem.push(REPLICAS[(proximo + i) % REPLICAS.length]);
  }
  proximo++;

  let ultimoErro;

  for (const alvo of ordem) {
    try {
      const resposta = await fetch(`${alvo}/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const data = await resposta.json();

      console.log(`[GATEWAY] pedido enviado para ${alvo}  ->  ${data.servedBy || "?"}`);

      res.set("X-Served-By", alvo);
      return res.status(resposta.status).json(data);
    } catch (erro) {
      console.warn(`[GATEWAY] ${alvo} indisponível, tentando a próxima réplica...`);
      ultimoErro = erro;
    }
  }

  console.error("[GATEWAY] nenhuma réplica disponível.");
  res.status(502).json({
    error: "Nenhuma réplica disponível",
    detalhe: String(ultimoErro),
  });
});

app.listen(PORT, () => {
  console.log(`[GATEWAY] rodando em http://localhost:${PORT}`);
});
