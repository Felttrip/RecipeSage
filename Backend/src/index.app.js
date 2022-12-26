require('./services/sentry-init.js');
const Sentry = require('@sentry/node');

const ElasticService = require('./services/elastic');
const SQ = require('sequelize');
const Op = SQ.Op;

const Recipe = require('./models').Recipe;

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || 250);
const BATCH_INTERVAL = parseInt(process.env.BATCH_INTERVAL || 1) * 1000;

let runInterval;

const runIndexOp = async () => {
  try {
    let lt = new Date();
    lt.setDate(lt.getDate() - 7);

    if (process.env.INDEX_BEFORE) {
      lt = new Date(process.env.INDEX_BEFORE); // Must be in '2020-03-01 22:20' format
    }

    const recipes = await Recipe.findAll({
      where: {
        [Op.or]: [
          { indexedAt: null },
          { indexedAt: { [Op.lt]: lt } }
        ]
      },
      limit: BATCH_SIZE
    });

    if (!recipes || recipes.length === 0) {
      clearInterval(runInterval);
      console.log('Index complete!');
      process.exit(0);
    }

    await ElasticService.indexRecipes(recipes);

    let ids = recipes.map(r => r.id);
    await Recipe.update(
      { indexedAt: new Date() },
      {
        where: {
          id: ids
        },
        silent: true,
        hooks: false
      }
    );
  } catch(e) {
    clearInterval(runInterval);
    Sentry.captureException(e);
    console.log('Error while indexing', e);
    process.exit(1);
  }
};

runInterval = setInterval(runIndexOp, BATCH_INTERVAL);

process.on('SIGTERM', () => {
  console.log('RECEIVED SIGTERM - STOPPING JOB');
  process.exit(0);
});

