import express from "express";
import cors from "cors";

import mercadopago from "mercadopago";

const app = express();

app.use(cors());

app.use(express.json());

const client = new mercadopago.MercadoPagoConfig({
  accessToken: "APP_USR-676571693378458-052703-0f7fdc35d8edb7c96dbb1e345760521a-3430570678",
});

const preference = new mercadopago.Preference(client);

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

    res.json({
      id: result.id,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao criar pagamento",
    });

  }

});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});