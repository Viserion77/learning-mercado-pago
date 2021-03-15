var mercadopago = require('mercadopago');
mercadopago.configurations.setAccessToken("TEST-783514449353831-030122-b66e9dae2a1bcf2c75e71cc217f34ece-244402927");

const express = require("express");
const app = express();

app.use(express.urlencoded());
app.use(express.json());

app.post("/process_payment", async function (req, res) {
  console.log(`>post/process_payment/${JSON.stringify(req.body)}`);

  var payment_data = {
    transaction_amount: Number(req.body.transactionAmount),
    token: req.body.token,
    description: `Teste ${req.body.description}`,
    installments: Number(req.body.installments),
    payment_method_id: req.body.paymentMethodId,
    issuer_id: req.body.issuer,
    payer: {
      email: req.body.email,
      identification: {
        type: req.body.docType,
        number: req.body.docNumber
      }
    }
  };

  await mercadopago.payment.save(payment_data)
    .then(function (response) {
      res.status(response.status).json({
        status: response.body.status,
        status_detail: response.body.status_detail,
        id: response.body.id
      });
    })
    .catch(function (error) {
      res.status('401').send(error);
    });

  res.send({ mas: 'oque é isto?' });
});

app.listen(3000);
console.log(`?listen/port/3000`);
