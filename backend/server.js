import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

const PORT = process.argv[2] || 3001;
const LABEL = process.argv[3] || "?";
const NAME = `Réplica ${LABEL} (porta ${PORT})`;

const app = express();

app.use(cors());
app.use(express.json());

const client = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-676571693378458-052703-0f7fdc35d8edb7c96dbb1e345760521a-3430570678",
});

const preference = new mercadopago.Preference(client);

app.get("/health", (req, res) => {
  res.json({ status: "ok", servedBy: NAME });
});

app.post("/create-preference", async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(req.body.price),
        },
      ],
    };

    const result = await preference.create({ body });

    console.log(`[${NAME}] criou a preferência ${result.id}`);

    res.json({
      id: result.id,
      servedBy: NAME,
    });
  } catch (error) {
    console.error(`[${NAME}] erro:`, error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.listen(PORT, () => {
  console.log(`${NAME} rodando.`);
});
