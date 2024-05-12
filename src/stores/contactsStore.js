import { defineStore } from 'pinia';
import axios from 'axios';
import { BACK_BASE_URL } from "@/constants"
import jwt_decode from "jwt-decode"
import router from "@/router"
export const useContactsStore = defineStore({
  id: 'contacts',
  state: () => ({
    contacts: [],
    newContact: {
      // Datos del nuevo contacto a enviar
      title: '',
      content: '',
      status: 'publish', // Estado del contacto (publicado)
      featured_media: '',
      meta: {
        name: '',
        lastname: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        province: '',
        country: '',
        group: [''],
        tags: [''],
        language: "",
        timezone: "",
      }
    }
  }),
  actions: {
    async fetchContacts() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No se encontró el token en el localStorage');
        }
        // Validamos que el token sea bueno
        if(await validarToken(token)){
          const response = await axios.get(`${BACK_BASE_URL}/wp-json/wp/v2/contacts`, {
          });
          // Iterar sobre la respuesta para guardar el ID y los datos del meta
          const contactsData = response.data.map(contact => ({
            id: contact.id,
            meta: contact.meta,
            img: contact.featured_media
          }));
          this.contacts = contactsData; // Mover esta línea dentro del bloque if
        } else{ await router.push("/login"); }
      } catch (error) {
        // console.error('Error al obtener los contactos:', error.message);
        console.log("Error al validar el token, necesario iniciar sesión")
        // Aquí puedes manejar el error de manera más útil, como mostrando un mensaje al usuario
      }
    },
    async addContact(contact) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No se encontró el token en el localStorage');
        }
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token // Corregir aquí, quitar el ":" después de 'Authorization'
        };
        const response = await axios.post(`${BACK_BASE_URL}/wp-json/wp/v2/contacts`, contact, {
          headers: headers
        });
        this.contacts.push(response.data);
      } catch (error) {
        console.error('Error al agregar el contacto:', error.message);
        // Aquí puedes manejar el error de manera más útil, como mostrando un mensaje al usuario
      }
    },
    async updateContact(id, updatedContact) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No se encontró el token en el localStorage');
        }
        await axios.put(`${BACK_BASE_URL}/wp-json/wp/v2/contacts/${id}`, updatedContact, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const index = this.contacts.findIndex(contact => contact.id === id);
        if (index !== -1) {
          this.contacts[index] = { ...this.contacts[index], ...updatedContact };
        }
      } catch (error) {
        console.error('Error al actualizar el contacto:', error.message);
        // Aquí puedes manejar el error de manera más útil, como mostrando un mensaje al usuario
      }
    },
    async deleteContact(id) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No se encontró el token en el localStorage');
        }
        await axios.delete(`${BACK_BASE_URL}/wp-json/wp/v2/contacts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.contacts = this.contacts.filter(contact => contact.id !== id);
      } catch (error) {
        console.error('Error al eliminar el contacto:', error.message);
        // Aquí puedes manejar el error de manera más útil, como mostrando un mensaje al usuario
      }
    },
  },
});


// Función para asociar la imagen destacada al contacto
async function setFeaturedMedia(contactId, featuredMediaId) {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No se encontró el token en el localStorage');
    }
    await axios.post(`${BACK_BASE_URL}/wp-json/wp/v2/contacts/${contactId}`, {
      featured_media: featuredMediaId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Imagen destacada asociada al contacto correctamente.');
  } catch (error) {
    console.error('Error al asociar la imagen destacada al contacto:', error);
    throw error;
  }
}
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

