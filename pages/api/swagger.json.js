import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IPSA API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve('./pages/api/blogs/index.js'),
    path.resolve('./pages/api/dashboard/index.js'),
    path.resolve('./pages/api/dashboard/weather.js'),
    path.resolve('./pages/api/dashboard/generate.js'),
    path.resolve('./pages/api/events/index.js'),
    path.resolve('./pages/api/catalogs/index.js'),
    path.resolve('./pages/api/categories/index.js'),
    path.resolve('./pages/api/categorypermissions/index.js'),
    path.resolve('./pages/api/certificates/index.js'),
    path.resolve('./pages/api/contacts/index.js'),
    path.resolve('./pages/api/countdowns/index.js'),
    path.resolve('./pages/api/countries/index.js'),
    path.resolve('./pages/api/forms/index.js'),
    path.resolve('./pages/api/products/[id].js'),
    path.resolve('./pages/api/products/index.js'),
    path.resolve('./pages/api/pages/index.js'),
    path.resolve('./pages/api/references/index.js'),
    path.resolve('./pages/api/regions/index.js'),
    path.resolve('./pages/api/region-members/index.js'),
    path.resolve('./pages/api/roles/index.js'),
    path.resolve('./pages/api/role-and-downloads/index.js'),
    path.resolve('./pages/api/sitesettings/index.js'),
    path.resolve('./pages/api/sitetags/index.js'),
    path.resolve('./pages/api/sliders/index.js'),
    path.resolve('./pages/api/sports-committees/index.js'),
    path.resolve('./pages/api/languages/index.js'),
    path.resolve('./pages/api/menus/index.js'),
    path.resolve('./pages/api/teammembers/index.js'),
    path.resolve('./pages/api/usermanual/index.js'),
    path.resolve('./pages/api/user-roles/index.js'),
    path.resolve('./pages/api/users/index.js'),
    path.resolve('./pages/api/users/auth.js'),
    path.resolve('./pages/api/users/login.js'),
    path.resolve('./pages/api/partners/index.js'),
    path.resolve('./pages/api/homepage/about/index.js'),
    path.resolve('./pages/api/homepage/experience-two/index.js'),
    path.resolve('./pages/api/homepage/facilities/index.js'),
    path.resolve('./pages/api/homepage/video/index.js'),
    path.resolve('./pages/api/homepage/footer/index.js'),
    path.resolve('./pages/api/homepage/success/index.js'),
    path.resolve('./pages/api/homepage/history/index.js'),
    path.resolve('./pages/api/homepage/contact-form/index.js'),
    path.resolve('./pages/api/homepage/about-content/index.js')


  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
}
