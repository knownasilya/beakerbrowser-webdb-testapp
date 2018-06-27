import Route from '@ember/routing/route';
import WebDB from '@beaker/webdb';

const archiveUrl = 'dat://warmish.hashbase.io';
const archive = new DatArchive(archiveUrl);
const webdb = new WebDB('webdb-example');
const assert = (val) => {
  if (!val) {
    throw new Error('assert failed');
  }
};

webdb.define('people', {
  // validate required attributes before indexing
  validate(record) {
    assert(record.firstName && typeof record.firstName === 'string');
    assert(record.lastName && typeof record.lastName === 'string');
    return true;
  },

  preprocess (record) {
    record.createdAt = Date.now();
    return record;
  },

  // secondary indexes for fast queries (optional)
  index: ['lastName', 'lastName+firstName', 'age', 'createdAt'],

  // files to index
  filePattern: [
    '/person.json',
    '/people/*.json'
  ]
});

// dat://warmish.hashbase.io/
export default Route.extend({
  async model() {
    await webdb.open();
    await webdb.indexArchive(archiveUrl);

    let peoplePath = '/people';

    // setup directory
    try {
      await archive.stat(peoplePath);
    } catch(e) {
      // no directory
      await archive.mkdir(peoplePath);
    }

    return webdb.people.orderBy('createdAt')
      .reverse()
      .toArray();
  },

  setupController(controller, people) {
    controller.setProperties({
      people,
      archive,
      webdb
    });
  }
});
