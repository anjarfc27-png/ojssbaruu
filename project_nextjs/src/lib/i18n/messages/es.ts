// Spanish translations (Español)
// Using English as base with Spanish translations
import { en } from './en';

export const es = {
  // Common
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    update: 'Actualizar',
    submit: 'Enviar',
    loading: 'Cargando...',
    saving: 'Guardando...',
    success: 'Éxito',
    error: 'Error',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    actions: 'Acciones',
    view: 'Ver',
    details: 'Detalles',
  },

  // Site Administration
  admin: {
    siteAdministration: 'Administración del Sitio',
    siteManagement: 'Gestión del Sitio',
    administrativeFunctions: 'Funciones Administrativas',
    hostedJournals: 'Revistas Alojadas',
    siteSettings: 'Configuración del Sitio',
    systemInformation: 'Información del Sistema',
    expireUserSessions: 'Expirar Sesiones de Usuario',
    clearDataCaches: 'Limpiar Cachés de Datos',
    clearTemplateCache: 'Limpiar Caché de Plantillas',
    clearScheduledTaskExecutionLogs: 'Limpiar Registros de Ejecución de Tareas Programadas',
    confirmExpireSessions: 'Esta acción cerrará la sesión de todos los usuarios. ¿Continuar?',
    confirmClearTemplateCache: '¿Limpiar la caché de plantillas compiladas?',
    confirmClearScheduledTasks: '¿Limpiar todos los registros de ejecución de tareas programadas?',
    openJournalSystems: 'Sistemas de Revistas Abiertas',
    dashboard: 'Panel de Control',
    users: 'Usuarios',
    statistics: 'Estadísticas',
    tasks: 'Tareas',
    logout: 'Cerrar Sesión',
    administration: 'Administración',
  },

  // Site Settings - reusing structure from en
  siteSettings: en.siteSettings,
  
  // Hosted Journals - reusing structure from en
  hostedJournals: en.hostedJournals,
  
  // Journal Settings Wizard - reusing structure from en
  wizard: en.wizard,
  
  // System Information - reusing structure from en
  systemInfo: en.systemInfo,
  
  // Languages - reusing structure from en
  languages: en.languages,
  
  // Form Messages - reusing structure from en
  messages: en.messages,
  
  // Editor Navigation
  editor: {
    navigation: {
      submissions: 'Envíos',
      issues: 'Números',
      announcements: 'Anuncios',
      settings: 'Configuración',
      context: 'Contexto',
      website: 'Sitio Web',
      workflow: 'Flujo de Trabajo',
      distribution: 'Distribución',
      access: 'Acceso',
      usersRoles: 'Usuarios y Roles',
      tools: 'Herramientas',
      statistics: 'Estadísticas',
      editorial: 'Editorial',
      publications: 'Publicaciones',
      users: 'Usuarios',
      openJournalSystems: 'Sistemas de Revistas Abiertas',
      siteAdministration: 'Administración del Sitio',
      noNewNotifications: 'No hay notificaciones nuevas',
      logout: 'Cerrar Sesión',
    },
    settings: en.editor.settings,
  },
};

