<template>
  <v-container
    >
    <v-sheet>
    <v-form action="/process_payment" method="post" id="paymentForm">
      <h3>Detalhe do comprador</h3>
      <div>
        <div>
          <v-text-field label="E-mail" id="email" name="email" type="text" value="test@test.com" />
        </div>
        <div>
          <v-select
            label="Tipo de documento"
            id="docType"
            name="docType"
            data-checkout="docType"
            type="text"
          ></v-select>
        </div>
        <div>
          <v-text-field
            label="Número do documento"
            id="docNumber"
            name="docNumber"
            data-checkout="docNumber"
            type="text"
          />
        </div>
      </div>
      <h3>Detalhes do cartão</h3>
      <div>
        <div>
          <v-text-field
            label="Titular do cartão"
            id="cardholderName"
            data-checkout="cardholderName"
            type="text"
          />
        </div>
        <div>
          <div>
            <v-text-field
              label="Mês"
              type="text"
              placeholder="MM"
              id="cardExpirationMonth"
              data-checkout="cardExpirationMonth"
              onselectstart="return false"
              onpaste="return false"
              oncopy="return false"
              oncut="return false"
              ondrag="return false"
              ondrop="return false"
              autocomplete="off"
            />
            <span class="date-separator">/</span>
            <v-text-field
              label="Ano"
              type="text"
              placeholder="YY"
              id="cardExpirationYear"
              data-checkout="cardExpirationYear"
              onselectstart="return false"
              onpaste="return false"
              oncopy="return false"
              oncut="return false"
              ondrag="return false"
              ondrop="return false"
              autocomplete="off"
            />
          </div>
        </div>
        <div>
          <v-text-field
            label="Número do cartão"
            type="text"
            id="cardNumber"
            data-checkout="cardNumber"
            onselectstart="return false"
            onpaste="return false"
            oncopy="return false"
            oncut="return false"
            ondrag="return false"
            ondrop="return false"
            autocomplete="off"
          />
        </div>
        <div>
          <v-text-field
            label="Código de segurança"
            id="securityCode"
            data-checkout="securityCode"
            type="text"
            onselectstart="return false"
            onpaste="return false"
            oncopy="return false"
            oncut="return false"
            ondrag="return false"
            ondrop="return false"
            autocomplete="off"
          />
        </div>
        <div id="issuerInput">
          <v-select label="Banco emissor" id="issuer" name="issuer" data-checkout="issuer"></v-select>
        </div>
        <div>
          <v-select label="Parcelas" type="text" id="installments" name="installments"></v-select>
        </div>
        <div>
          <v-text-field
            type="hidden"
            name="transactionAmount"
            id="transactionAmount"
            value="100"
          />
          <v-text-field type="hidden" name="paymentMethodId" id="paymentMethodId" />
          <v-text-field type="hidden" name="description" id="description" />
          <br />
          <v-btn type="submit">Pagar</v-btn>
          <br />
        </div>
      </div></v-form
  ></v-sheet></v-container>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    doSubmit: false,
    req: {},
    res: {},
    response: {},
  }),
  beforeCreate() {
    window.Mercadopago.setPublishableKey("YOUR_PUBLIC_KEY");
    window.Mercadopago.getIdentificationTypes();
  },
  methods: {
    ObtenhaMetodoPagamentoCartao() {
      document
        .getElementById("cardNumber")
        .addEventListener("change", this.guessPaymentMethod);
    },
    CrieTokenCartao() {
      this.doSubmit = false;
      document
        .getElementById("paymentForm")
        .addEventListener("submit", this.getCardToken);
    },
    EnviePagamentoMercadoPago() {
      var mercadopago = require("mercadopago");
      mercadopago.configurations.setAccessToken("YOUR_ACCESS_TOKEN");

      var payment_data = {
        transaction_amount: Number(this.req.body.transactionAmount),
        token: this.req.body.token,
        description: this.req.body.description,
        installments: Number(this.req.body.installments),
        payment_method_id: this.req.body.paymentMethodId,
        issuer_id: this.req.body.issuer,
        payer: {
          email: this.req.body.email,
          identification: {
            type: this.req.body.docType,
            number: this.req.body.docNumber,
          },
        },
      };

      mercadopago.payment
        .save(payment_data)
        .then(function (response) {
          this.res.status(response.status).json({
            status: response.body.status,
            status_detail: response.body.status_detail,
            id: response.body.id,
          });
        })
        .catch(function (error) {
          this.res.status(this.response.status).send(error);
        });
    },
    getCardToken(event) {
      event.preventDefault();
      if (!this.doSubmit) {
        let $form = document.getElementById("paymentForm");
        window.Mercadopago.createToken($form, this.setCardTokenAndPay);
        return false;
      }
    },
    setCardTokenAndPay(status, response) {
      if (status == 200 || status == 201) {
        let form = document.getElementById("paymentForm");
        let card = document.createElement("input");
        card.setAttribute("name", "token");
        card.setAttribute("type", "hidden");
        card.setAttribute("value", response.id);
        form.appendChild(card);
        this.doSubmit = true;
        form.submit();
      } else {
        alert("Verify filled data!\n" + JSON.stringify(response, null, 4));
      }
    },

    getIssuers(paymentMethodId) {
      window.Mercadopago.getIssuers(paymentMethodId, this.setIssuers);
    },
    getInstallments(paymentMethodId, transactionAmount, issuerId) {
      window.Mercadopago.getInstallments(
        {
          payment_method_id: paymentMethodId,
          amount: parseFloat(transactionAmount),
          issuer_id: parseInt(issuerId),
        },
        this.setInstallments
      );
    },

    setInstallments(status, response) {
      if (status == 200) {
        document.getElementById("installments").options.length = 0;
        response[0].payer_costs.forEach((payerCost) => {
          let opt = document.createElement("option");
          opt.text = payerCost.recommended_message;
          opt.value = payerCost.installments;
          document.getElementById("installments").appendChild(opt);
        });
      } else {
        alert(`installments method info error: ${response}`);
      }
    },
    setIssuers(status, response) {
      if (status == 200) {
        let issuerSelect = document.getElementById("issuer");
        response.forEach((issuer) => {
          let opt = document.createElement("option");
          opt.text = issuer.name;
          opt.value = issuer.id;
          issuerSelect.appendChild(opt);
        });

        this.getInstallments(
          document.getElementById("paymentMethodId").value,
          document.getElementById("transactionAmount").value,
          issuerSelect.value
        );
      } else {
        alert(`issuers method info error: ${response}`);
      }
    },

    guessPaymentMethod(event) {
      let cardnumber = document.getElementById("cardNumber").value;
      if (cardnumber.length >= 6) {
        let bin = cardnumber.substring(0, 6);
        window.Mercadopago.getPaymentMethod(
          {
            bin: bin,
          },
          this.setPaymentMethod
        );
      }
      console.log(event);
    },

    setPaymentMethod(status, response) {
      if (status == 200) {
        let paymentMethod = response[0];
        document.getElementById("paymentMethodId").value = paymentMethod.id;

        this.getIssuers(paymentMethod.id);
      } else {
        alert(`payment method info error: ${response}`);
      }
    },
  },
};
</script>
