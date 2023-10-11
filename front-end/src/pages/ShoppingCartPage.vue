<template>
  <h1>Shopping Cart</h1>
  <div v-if="cartItems.length > 0">
    <ShoppingCartList @remove-from-cart="removeFromCart($event)" :cartItems="cartItems" />
    <button class="checkout-button">Proceed to Checkout</button>
  </div>
  <div v-else>
    You have no items in your cart!
  </div>
</template>

<script>
import axios from 'axios';
import ShoppingCartList from '@/components/ShoppingCartList.vue';

export default {
  name: "ShoppingCartPage",
  props: ['user'],
  methods: {
    async removeFromCart(productId) {
      const response = await axios.delete(`/api/users/${this.user.uid}/cart/${productId}`);
      const updatedCart = response.data;
      this.cartItems = updatedCart;
    }
  },
  components: { ShoppingCartList },
  data() {
    return {
      cartItems: []
    }
  },
  watch: {
    async user(newUserValue) {
      console.log('-');
      if (newUserValue) {
        
        const response2 = await axios.get(`/api/users/${newUserValue.uid}/cart`);
        const cartItems = response2.data;
        console.log(cartItems);
        this.cartItems = cartItems;
      }
    }
  },
  async created() {
    if(this.user) {
      const response = await axios.get(`/api/users/${this.user.uid}/cart`);
      const cartItems = response.data;
      this.cartItems = cartItems;
    }
  }
}
</script>