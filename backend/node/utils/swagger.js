const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const SPEC_CANDIDATES = [
  path.resolve(__dirname, '../../../docs/openapi.yaml'),
  path.resolve(__dirname, '../../docs/openapi.yaml'),
  path.resolve(__dirname, '../docs/openapi.yaml')
];

function resolveSpecPath() {
  for (const candidate of SPEC_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      console.log(`[swagger] usando spec en ${candidate}`);
      return candidate;
    }
    console.log(`[swagger] spec no encontrada en ${candidate}`);
  }
  console.error('[swagger] No se encontró docs/openapi.yaml en rutas conocidas');
  return null;
}

const SPEC_PATH = resolveSpecPath();

function readSpecAsJson() {
  if (!SPEC_PATH) {
    return null;
  }
  try {
    const yamlRaw = fs.readFileSync(SPEC_PATH, 'utf8');
    return YAML.parse(yamlRaw);
  } catch (error) {
    console.error('[swagger] Error al parsear openapi.yaml:', error.message);
    return null;
  }
}

const setupSwagger = (app) => {
  if (SPEC_PATH) {
    app.get('/openapi.yaml', (_req, res) => {
      res.sendFile(SPEC_PATH);
    });

    app.get('/api-docs.json', (_req, res) => {
      const jsonSpec = readSpecAsJson();
      if (!jsonSpec) {
        return res.status(500).send('OpenAPI spec not available');
      }
      res.json(jsonSpec);
    });

    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(null, {
        explorer: true,
        customSiteTitle: 'GymPoint API Docs',
        swaggerOptions: {
          url: '/api-docs.json',
          displayRequestDuration: true,
          docExpansion: 'none'
        }
      })
    );
  } else {
    app.get('/docs', (_req, res) => {
      res.status(500).send('OpenAPI spec not available');
    });
    app.get('/api-docs.json', (_req, res) => {
      res.status(500).send('OpenAPI spec not available');
    });
  }

  app.get('/api-docs', (_req, res) => res.redirect(301, '/docs'));
};

module.exports = setupSwagger;
