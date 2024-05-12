<script setup>
import { ref, watch, onMounted } from 'vue';
import { useContactsStore } from '@/stores/contactsStore';
import { VDataTable, VSkeletonLoader } from "vuetify/labs/components"
import { useImagesStore } from "@/stores/imageStore"
import Loader from "@/components/loader.vue"
import router from "@/router"

// Lista de colores amigables
const friendlyColors = [
  '#2196F3', // Azul
  '#4CAF50', // Verde
  '#FFC107', // Amarillo
  '#9C27B0', // Morado
  '#FF5722', // Naranja
  '#607D8B', // Gris
  '#E91E63', // Rosa
  '#FF9800', // Ámbar
  '#795548', // Marrón
  '#9E9E9E', // Gris
  '#03A9F4', // Azul claro
  '#8BC34A', // Verde claro
  '#FFEB3B', // Lima
  '#673AB7', // Morado oscuro
  '#FF5252', // Rojo
  '#9C27B0', // Morado
  '#00BCD4', // Cian
  '#CDDC39', // Verde lima
  '#FF9800', // Naranja
  '#FF5722'  // Naranja oscuro
];

const contactsStore = useContactsStore();
const imageStore = useImagesStore();
const search = ref('');
const filteredContacts = ref([]);
const selectedRows = ref([]);
const tagColors = {};
const isLoading = ref(false)

// Cabecera de la tabla
const tableHeaders = [
  { title: 'Nombre', value: 'name' },
  { title: 'Email', value: 'email' },
  { title: 'Grupo', value: 'group' },
  { title: 'Teléfono', value: 'phone' },
  { title: 'Tags', value: 'tags' },
  { title: 'Acción', sortable: false }
];
// Ir a nuevo contacto
const crearNuevoContacto = () => {
  router.push('/contacts/new-contact');
}
// Funcion para cargar todas las imagenes A REVISAR, poner un default
const loadContactImages = async () => {
  await Promise.all(contactsStore.contacts.map(async (contact) => {
    const imageUrl = await imageStore.getImageFromId(contact.img);
    contact.img = imageUrl;
  }));
};

// Funcion para la búsqueda de contactos, aplica búsqueda a todos los campos
const searchContacts = () => {
  isLoading.value = true;
  const searchTerm = search.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (!searchTerm) {
    filteredContacts.value = contactsStore.contacts.map(contact => ({
      id: contact.id,
      name: `${contact.meta.name} ${contact.meta.lastname}`,
      email: contact.meta.email,
      group: contact.meta.group.join(', '),
      phone: contact.meta.phone,
      tags: contact.meta.tags.join(', '), // Unir las tags con comas
      img: contact.img // Mantener la propiedad img sin cambios
    }));
  } else {
    filteredContacts.value = contactsStore.contacts.filter(contact => {
      const id = contact.id;
      const fullName = `${contact.meta.name} ${contact.meta.lastname}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const email = contact.meta.email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const phone = contact.meta.phone.toLowerCase();
      // const group = contact.meta.group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const group = contact.meta.group.map(group => group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      const tags = contact.meta.tags.map(tag => tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

      return fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        group.some(group => group.includes(searchTerm)) ||
        tags.some(tag => tag.includes(searchTerm)); // Utilizar some para buscar en las tags
    }).map(filteredContact => ({
      id: filteredContact.id,
      name: `${filteredContact.meta.name} ${filteredContact.meta.lastname}`,
      email: filteredContact.meta.email,
      group: filteredContact.meta.group.join(', '), // Unir los groups con comas
      phone: filteredContact.meta.phone,
      tags: filteredContact.meta.tags.join(', '), // Unir las tags con comas
      img: filteredContact.img // Mantener la propiedad img sin cambios
    }))
      .filter(contact => contact.id !== undefined) // Filtrar aquellos contactos sin ID definido
    ;
  }
  isLoading.value = false;
  generateTagColors(); // Llamar a la función para asignar colores a las etiquetas
};


const generateTagColors = () => {
  let colorIndex = 0;
  filteredContacts.value.forEach(contact => {
    if (contact.tags) {
      contact.tags.split(', ').forEach(tag => {
        const trimmedTag = tag.trim();
        if (!tagColors[trimmedTag]) {
          // Asignar el siguiente color de la lista
          tagColors[trimmedTag] = friendlyColors[colorIndex % friendlyColors.length];
          colorIndex++;
        }
      });
    }
  });
};

// Funcion para obtener las iniciales de 2 palabras, para el uso en el caso de no haber imagen
function obtainInitials(words) {
  const wordArray = words.split(" ");
  let initials = "";
  initials += wordArray[0].charAt(0);
  if (wordArray.length > 1) {
    initials += wordArray[1].charAt(0);
  }
  return initials.toUpperCase();
}

const showActions = (contact) => {
  // Implementar la lógica para mostrar las acciones para el contacto dado
};

watch(search, () => {
  searchContacts();
});

onBeforeMount(async () => {
  if(contactsStore.contacts.length<=0) await contactsStore.fetchContacts();
  await loadContactImages();
  searchContacts();
});

</script>

<template>
  <div>
  <!-- <loader v-if="isLoading"></loader> -->
    <section>
    <h2 class="text-h5 mb-10">
      Contactos
    </h2>
    <VCard id="contact-list">
      <VCardText class="d-flex justify-end flex-wrap gap-4">
        <div class="d-flex justify-end align-center flex-wrap gap-4" style="width: 100%">
          <!-- 👉 Buscar  -->
          <div class="invoice-list-search" style="width: 40%">
            <VTextField
              v-model="search"
              placeholder="Buscar contacto"
              density="compact"
              class="text-field-large"
            />
          </div>
          <!-- 👉 Crear contacto -->
          <VBtn
            @click="crearNuevoContacto"
            prepend-icon="mdi-plus"
          >
            Añadir contacto
          </VBtn>
        </div>
      </VCardText>

      <!-- SECTION DataTable -->

      <VFadeTransition>
        <VDataTable
          v-model="selectedRows"
          :headers="tableHeaders"
          :items="filteredContacts"
          show-select
          v-if="filteredContacts.length > 0"
          class="text-no-wrap rounded-0"
          :loading="isLoading"
        >

          <template #item="{ item }">
            <tr>
              <td>
                <v-checkbox
                  v-model="item.props.title.selected"
                  primary
                  hide-details
                ></v-checkbox>
              </td>
              <td class="pa-0">
                <VAvatar
                  size="36px"
                  class="ma-3"
                  v-if="item.props.title.img"
                >
                  <VImg
                    alt="Avatar"
                    v-slot:placeholder
                    :src="item.props.title.img && item.props.title.img.src"
                    :lazy-src="item.props.title.img && item.props.title.img.src"
                  />
                </VAvatar>
                <VAvatar
                  color="primary"
                  size="36px"
                  class="ma-3"
                  v-else
                >
                  <span class="text-s">
                    {{ obtainInitials(item.props.title.name) }}
                  </span>
                </VAvatar>
                <span class="text-sm mb-0" style="font-weight: 600">
                {{ item.props.title.name }}
                </span>
              </td>
              <td>{{ item.props.title.email }}</td>
              <td>
                <VChip
                  v-if="item.props.title.group"
                  v-for="(group, index) in item.props.title.group.split(', ')"
                  :key="index"
                  color="primary"
                  class="pa-1"
                  variant="text"
                >
                  #{{ group.trim() }}
                </VChip>
              </td>
              <td>{{ item.props.title.phone }}</td>
              <td>
                <VChip
                  v-if="item.props.title.tags"
                  v-for="(tag, index) in item.props.title.tags.split(', ')"
                  :key="index"
                  :color="tagColors[tag.trim()] || 'primary'"
                  class="me-1"
                >
                  {{ tag.trim() }}
                </VChip>
              </td>
              <!-- Aquí puedes agregar la columna para las acciones -->
              <td>
                <!-- Implementa la lógica para mostrar las acciones -->
                <v-icon small @click="showActions(item)">mdi-dots-vertical</v-icon>
              </td>
            </tr>
          </template>
        </VDataTable>
      </VFadeTransition>
      <Loader v-if="isLoading"></Loader>

      <!-- !SECTION -->
    </VCard>
  </section>
  </div>
</template>

<style scoped>
</style>
