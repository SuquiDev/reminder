import { defineStore } from 'pinia';
import { BACK_BASE_URL } from '@/constants'
import axios from "@axios"

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    token: null,
    user: null,
  }),
  actions: {
    // Acción para iniciar sesión
    async login(email, password) {
      try {
        // Realizar una solicitud HTTP para autenticar al usuario
        const response = await fetch(`${BACK_BASE_URL}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        // Verificar si la solicitud fue exitosa
        if (response.ok) {
          // Extraer el token JWT del cuerpo de la respuesta
          const { token } = await response.json()

          // Almacenar el token en el estado de la tienda
          this.token = token

          return true // Indicar que el inicio de sesión fue exitoso
        } else {
          // Manejar errores de autenticación
          return false // Indicar que el inicio de sesión fue fallido
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        return false // Indicar que el inicio de sesión fue fallido
      }
    },
    // Acción para cerrar sesión
    logout() {
      // Limpiar el token y la información del usuario en el estado de la tienda
      this.token = null
      this.user = null
    },
    // Acción para actualizar el token de autenticación
    update(token) {
      this.token = token;
    },
    async  validarToken(token) {
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
  },
})
