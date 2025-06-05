import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ürün API Dokümantasyonu',
      version: '1.0.0',
    },
  },
  apis: ['./pages/api/products/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  return swaggerUi.setup(swaggerSpec)(req, res);
}
