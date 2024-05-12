import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router'

import routes from '~pages'
import { useAuthStore } from "@/stores/authStore"
import axios from "@axios"
import { BACK_BASE_URL } from "@/constants"



const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        const userRole = (userData && userData.role) ? userData.role : null
        const userToken = localStorage.getItem('accessToken')
        if (userRole === 'admin' && validarToken(userToken))
          return { name: 'index' }
        return { name: 'login', query: to.query }
      },
    },
    {
      path: '/login'
    },
    ...setupLayouts(routes),
  ],
})

 router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('accessToken');
  // Verificar si la ruta requiere autenticación y si el usuario está autenticado
  if (to.meta.requiresAuth &&  !validarToken(loggedIn)) {
    next('/login'); // Redirigir al usuario al inicio de sesión si intenta acceder a una ruta protegida sin autenticarse
  } else {
    next(); // Continuar con la navegación normal
  }
})


async function validarToken(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
  };
  try {
    const response = await axios.post(`${BACK_BASE_URL}/wp-json/jwt-auth/v1/token/validate`, {}, {
      headers: headers
    });
    // Verificar si la respuesta tiene el formato esperado y si el token es válido
    if (response.data && response.data.success && response.data.statusCode === 200) {
      return true;
    } else {
      console.error('El token JWT no es válido.');
      return false;
    }
  } catch (error) {
    console.error('Error al validar el token JWT:', error);
    return false;
  }
}

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
export default router
