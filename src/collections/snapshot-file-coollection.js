// import DomainCollection from 'cytomine-client/src/collections/domain-collection.js';
import DomainCollection from './domain-collection.js';
import SnapshotFile from '../models/snapshot-file.js';

export default class SnapshotFileCollection extends DomainCollection {

  /** @inheritdoc */
  static get model() {
    return SnapshotFile;
  }
}
