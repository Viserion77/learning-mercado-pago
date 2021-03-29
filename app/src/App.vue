<template>
  <v-container>
    <v-container v-if="!viewFormPay">
      <v-row>
        <v-col cols="3"
          ><v-btn @click="totalValue -= Number(incrementValue)">-</v-btn></v-col
        >
        <v-col
          ><v-text-field
            label="Incremente valor"
            type="number"
            v-model="incrementValue"
          ></v-text-field
        ></v-col>
        <v-col cols="3"
          ><v-btn @click="totalValue += Number(incrementValue)">+</v-btn></v-col
        >
      </v-row>
      <v-row
        ><v-col>Valor a pagar: {{ totalValue }}</v-col
        ><v-col cols="3"
          ><v-btn @click="viewFormPay = !viewFormPay">Pagar</v-btn></v-col
        ></v-row
      >
    </v-container>
    <MercadoPago v-if="viewFormPay" :totalValue="totalValue"/>
  </v-container>
</template>

<script>
import MercadoPago from "./components/MercadoPago.vue";

export default {
  name: "App",
  components: {
    MercadoPago,
  },
  data: () => ({
    totalValue: 10,
    incrementValue: 10,
    viewFormPay: false,
  }),
  watch: {
    totalValue(totalValue) {
      if (totalValue < 10) {
        this.totalValue = 10;
      }
    },
  },
};
</script>
