// Store para las imágenes utilizadas
import { defineStore } from 'pinia';
import {BACK_BASE_URL} from "@/constants"
import axios from "axios"

export const useImagesStore = defineStore({
    id: 'images',
    state: () => ({
        images: {} // Objeto para almacenar las imágenes, donde las claves son los IDs de las imágenes
    }),
    actions: {
        // Método para agregar una imagen al array
        addImage(image) {
            this.images[image.id] = image;
        },
        // Método para obtener los datos de una imagen a través de un ID, que es lo que devuelve WP
        async getImageFromId(id) {
            if(id === 0) return null
            if (this.images[id]) {
                return this.images[id];
            } else {
                try {
                    const imageUrl = `${BACK_BASE_URL}/wp-json/wp/v2/media/${id}`;
                    const response = await fetch(imageUrl); // Utiliza fetch nativo para realizar la solicitud
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    const image = {
                        id: id,
                        src: data.source_url,
                        alt: data.alt_text
                    };
                    this.addImage(image);
                    return image;
                } catch (error) {
                    console.error('Error al obtener los datos de la imagen:', error);
                    return null;
                }
            }
        },
        // Función para subir la imagen al servidor de WordPress
        async  uploadFeaturedImage(imageData, fileName) {
          try {
            const formData = new FormData();
            formData.append('file', dataURItoBlob(imageData), fileName)
            const token = localStorage.getItem('accessToken')
            const response = await axios.post(`${BACK_BASE_URL}/wp-json/wp/v2/media`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
            });
            return response.data.id; // Devuelve el ID de la imagen subida
          } catch (error) {
            console.error('Error al subir la imagen destacada:', error);
            throw error;
          }
        }
    }
});

// Función para convertir datos URI a Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}
