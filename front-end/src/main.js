import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import * as VueRouter from 'vue-router'
import ShoppingCartPage from './pages/ShoppingCartPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import NotFoundPage from './pages/NotFoundPage'

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: `${process.env.FIREBASE_API_KEY}`,
  authDomain: "fsv-linkedinlearning.firebaseapp.com",
  projectId: "fsv-linkedinlearning",
  storageBucket: "fsv-linkedinlearning.appspot.com",
  messagingSenderId: "145831612012",
  appId: "1:145831612012:web:cbb9f7d254fcf21da09249"
};

initializeApp(firebaseConfig);

createApp(App)
  .use(VueRouter.createRouter({
    history: VueRouter.createWebHistory(process.env.BASE_URL),
    routes: [
      {
        path: '/cart',
        component: ShoppingCartPage
      },
      {
        path: '/products',
        component: ProductsPage
      },
      {
        path: '/products/:productId',
        component: ProductDetailsPage
      },
      {
        path: '/',
        redirect: '/products'
      },
      {
        path: '/:pathMatch(.*)',
        component: NotFoundPage
      }
    ]
  }))
  .mount('#app')
