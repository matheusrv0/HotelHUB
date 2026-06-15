# Hotel Hub

Hotel Hub é um sistema de reserva de hotéis.

## Tecnologias

- HTML
- CSS
- JavaScript
- Node.js
- Firebase
- Mercado Pago
- Cloudinary

## Funcionalidades

- Cadastro e login
- Login com Google
- Painel administrativo
- Cadastro e exclusão de hotéis
- Upload de imagens
- Busca de hotéis
- Checkout online

## Estrutura

frontend/
- index.html
- login.html
- cadastro.html
- admin.html
- css/
- js/

backend/
- gateway.js  (recepcionista / API Gateway — porta 3000)
- server.js   (réplica do backend — roda em 3001 e 3002)

## Como executar

Pré-requisito: Node.js 18 ou superior.

```bash
cd backend
npm install
npm start
```

O `npm start` sobe tudo de uma vez. Abra o site em **http://localhost:3000**.

| Parte | Endereço |
|-------|----------|
| Gateway (entrada do site) | http://localhost:3000 |
| Réplica A | http://localhost:3001 |
| Réplica B | http://localhost:3002 |

## Arquitetura (sistema distribuído)

O site conversa **só com o Gateway** (porta 3000). O Gateway:

- entrega as páginas do site;
- distribui os pedidos de pagamento entre as 2 réplicas, **revezando** (round-robin);
- se uma réplica cair, redireciona para a outra (**tolerância a falha**).

```
Navegador → Gateway :3000 ─┬─► Réplica A :3001 ─┐
                           └─► Réplica B :3002 ─┴─► Mercado Pago
```

## Como demonstrar na apresentação

**Balanceamento:** faça vários pedidos de reserva e observe, no terminal, o Gateway
alternando entre "Réplica A" e "Réplica B".

**Tolerância a falha:** derrube uma réplica e veja o sistema continuar pela outra.

- Ver o estado das réplicas: abra http://localhost:3000/health
- Derrubar a Réplica A (Mac/Linux): `kill $(lsof -ti tcp:3001 -sTCP:LISTEN)`

> Observação: o Mercado Pago está configurado com **token de teste** (sandbox),
> então nenhum pagamento é cobrado de verdade.
