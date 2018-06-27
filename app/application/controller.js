import Controller from '@ember/controller';
import uuid from 'uuid';

export default Controller.extend({
  async fetchAll() {
    let webdb = this.webdb;

    // refetch all
    let people = await webdb.people.orderBy('createdAt')
      .reverse()
      .toArray();

    this.set('people', people);
  },

  actions: {
    async add() {
      let webdb = this.webdb;
      let archiveUrl = this.archive.url;
      let id = uuid.v4();
      let peoplePath = '/people';
      let peopleUrl = `${archiveUrl}${peoplePath}`;
      let { firstName, lastName, age } = this.getProperties('firstName', 'lastName', 'age');

      await webdb.people.upsert(`${peopleUrl}/${id}.json`, {
        firstName,
        lastName,
        age
      });

      // clear inputs
      this.setProperties({
        firstName: '',
        lastName: '',
        age: undefined
      });

      await this.fetchAll();
    },

    async deleteAll() {
      let webdb = this.webdb;

      await webdb.people.delete();
      await this.fetchAll();
    }
  }
});
