export default [
  {
    title: 'Reminders',
    to: { name: 'index' },
    icon: { icon: 'mdi-email-outline' },
    children: [
      {
        title: 'Ver todos',
        to: { name: 'index' },
      },
      {
        title: 'Proyectos',
        to: { name: 'projects-page' },
      },
    ],
  },
  {
    title: 'Agenda',
    to: { name: 'contacts' },
    icon: { icon: 'mdi-user-outline' },
    children: [
      {
        title: 'Contactos',
        to: { name: 'contacts' },
      },
      {
        title: 'Grupos',
        to: { name: 'groups-page' },
      },
    ],
  },
  {
    title: 'Integraciones',
    to: { name: 'integrations-page' },
    icon: { icon: 'mdi-file-code' },
  },
  {
    title: 'Avisos',
    to: { name: 'notifications-page' },
    icon: { icon: 'mdi-bell-outline' },
  },
]
