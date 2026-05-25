import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '☕ Brio Cafe API',
      version: '1.0.0',
      description: `
## REST API для итальянского кафе Brio

### Возможности:
- **Меню** — категории и блюда с поддержкой двух языков (рус/ит), загрузка фото
- **Галерея** — фотогалерея с автоматической оптимизацией и генерацией миниатюр
- **Контакты** — контактная информация и расписание работы
- **Авторизация** — JWT-авторизация для администраторской панели

### Авторизация:
Большинство мутаций требуют JWT-токен в заголовке:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`
      `,
      contact: { name: 'Brio Cafe', email: 'dev@brio-cafe.ru' },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен, полученный при входе',
        },
      },
      responses: {
        Unauthorized: {
          description: 'Токен не предоставлен или истёк',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Токен авторизации не предоставлен' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Ресурс не найден',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Авторизация и управление пользователями' },
      { name: 'Menu', description: 'Категории и блюда меню' },
      { name: 'Gallery', description: 'Фотогалерея кафе' },
      { name: 'Contacts', description: 'Контакты и расписание' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
