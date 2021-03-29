<template>
  <v-sheet>
    <form
      action="http://localhost:3000/process_payment"
      method="post"
      id="paymentForm"
    >
      <h3>Detalhe do comprador</h3>
      <div>
        <div>
          <v-text-field
            label="E-mail"
            id="email"
            name="email"
            type="text"
            v-model="email"
          />
        </div>
        <div>
          <select
            label="Tipo de documento"
            id="docType"
            name="docType"
            data-checkout="docType"
            type="text"
          ></select>
        </div>
        <div>
          <v-text-field
            label="Número do documento"
            v-model="documentNumber"
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
            v-model="cardHolder"
          />
        </div>
        <div>
          <div>
            <v-row
              ><v-col>
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
                  v-model="cardExpirationMonth"
                  autocomplete="off" /></v-col
              ><v-col> <span class="date-separator">/</span></v-col>
              <v-col
                ><v-text-field
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
                  v-model="cardExpirationYear"
                />
              </v-col>
            </v-row>
          </div>
        </div>
        <v-row
          ><v-col>
            <div>
              <v-text-field
                label="Número do cartão"
                type="text"
                id="cardNumber"
                v-model="cardNumber"
                @change="guessPaymentMethod()"
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
          </v-col>
          <v-col>
            <div>
              <v-text-field
                label="Código de segurança"
                id="securityCode"
                data-checkout="securityCode"
                type="text"
                onselectstart="return false"
                v-model="securityCode"
                onpaste="return false"
                oncopy="return false"
                oncut="return false"
                ondrag="return false"
                ondrop="return false"
                autocomplete="off"
              />
            </div> </v-col
        ></v-row>
        <div id="issuerInput">
          <select
            label="Banco emissor"
            id="issuer"
            name="issuer"
            data-checkout="issuer"
          ></select>
        </div>
        <div>
          <select
            label="Parcelas"
            type="text"
            id="installments"
            name="installments"
          ></select>
        </div>
        <div>
          <input
            type="hidden"
            name="transactionAmount"
            id="transactionAmount"
            :value="totalValue"
          />
          <input type="hidden" name="paymentMethodId" id="paymentMethodId" />
          <v-text-field
            name="description"
            id="description"
            v-model="description"
          />
          <br />
          <v-btn @click="getCardToken()">Pagar</v-btn>
          <br />
        </div>
      </div></form
  ></v-sheet>
</template>
<script>
export default {
  props: ["totalValue"],
  data: () => ({
    doSubmit: false,
    req: {},
    res: {},
    response: {},
    cardNumber: "503143321540635",
    documentNumber: "12345678909",
    email: "jeferson.a.oficial@gmail.com",
    cardHolder: "Jeferson Alves",
    cardExpirationMonth: 11,
    cardExpirationYear: 25,
    securityCode: 123,
    description: "Teste",
  }),
  beforeCreate() {
    window.Mercadopago.setPublishableKey(
      "TEST-23be4fc1-ca50-41cf-ae4d-00dcaa2ea0ee"
    );
    window.Mercadopago.getIdentificationTypes();
  },
  methods: {
    getCardToken() {
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
        //card.setAttribute("type", "hidden");
        card.setAttribute("value", response.id);
        console.log(response.id);
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

    guessPaymentMethod() {
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
      this.doSubmit = false;
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
