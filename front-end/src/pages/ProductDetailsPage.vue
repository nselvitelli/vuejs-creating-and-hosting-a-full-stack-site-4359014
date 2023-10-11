<template>
  <div v-if="product">
    <div class="img-wrap">
      <img :src="product.imageUrl" />
    </div>
    <div class="product-details">
      <h1>{{ product.name }}</h1>
      <h3 class="price">{{ product.price }}</h3>
      <button class="add-to-cart grey-button" v-if="user && productInCart">Item added to cart</button>
      <button @click="addToCart" class="add-to-cart" v-if="user && !productInCart">Add to cart</button>
      <button class="sign-in" @click="signIn" v-if="!user">Sign in to add to cart</button>
    </div>
  </div>
  <div v-else>
    <NotFoundPage />
  </div>
</template>

<script>
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import axios from 'axios';
import NotFoundPage from './NotFoundPage.vue';

export default {
  name: "ProductDetailsPage",
  props: ['user'],
  methods: {
    async addToCart() {
      await axios.post(`/api/users/${this.user.uid}/cart/`, {id: this.$route.params.productId});
      this.productInCart=true
      alert('Added item to cart!');
    },
    async signIn() {
      const email = prompt('Please enter your email to sign in:');
      if(email) {
        const auth = getAuth();
        const actionCodeSettings = {
          url: `https://full-stack-vue-deployment-ez50.onrender.com/products/${this.$route.params.productId}`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        alert('A login link was sent to ' + email);
        window.localStorage.setItem('emailForSignIn', email);
      }
    }
  },
  components: { NotFoundPage },
  data() {
    return {
      product: {},
      productInCart: false
    }
  },
  watch: {
    async user(newUserValue) {
      if (newUserValue) {
        const response2 = await axios.get(`/api/users/${newUserValue.uid}/cart`);
        const cartItems = response2.data;
        this.productInCart = cartItems.some(item => item.id == this.$route.params.productId);
      }
    }
  },
  async created() {
    const auth = getAuth();
    if(isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn');
      await signInWithEmailLink(auth, email, window.location.href);
      alert('Successfully signed in!');
      window.localStorage.removeItem('emailForSignIn');
    }

    const response = await axios.get(`/api/products/${this.$route.params.productId}`);
    const product = response.data;
    this.product = product;

    if(this.user) {
      const response2 = await axios.get(`/api/users/${this.user.uid}/cart`);
      const cartItems = response2.data;
      this.productInCart = cartItems.some(item => item.id == this.$route.params.productId);
    }
  }
}
</script>