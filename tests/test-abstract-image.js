import * as utils from './utils.js';
import {AbstractImage, AbstractImageCollection, User, UploadedFile} from '@';

// QUESTION: investigate problem of access rights (You don't have the right to read or modity this resource!
//          be.cytomine.image.AbstractImage : {id}, {id})
// when authenticated as admin, POST api/abstractimage.json redirects to GET api/abstractimage.json
describe('AbstractImage', function() {

  let filename = utils.randomString();
  let mime = 'image/tiff'; // QUESTION discuss with Renaud if it is appropriate to have mimetype instead of extension + change API documenation
  let path = `path/${filename}`;
  let width = 500;
  let height = 500;

  let abstractImage = null;
  let id = 0;

  before(async function() {
    await utils.connect(true);
  });

  describe('Create', function() {
    it('Create', async function() {
      abstractImage = new AbstractImage({filename, path, mime, width, height});
      abstractImage = await abstractImage.save();
      id = abstractImage.id;
      expect(abstractImage).to.be.an.instanceof(AbstractImage);
      expect(abstractImage.filename).to.equal(filename);
    });
  });

  describe('Fetch', function() {
    it('Fetch with static method', async function() {
      let fetchedImage = await AbstractImage.fetch(id);
      expect(fetchedImage).to.be.an.instanceof(AbstractImage);
      expect(fetchedImage.filename).to.equal(filename);
    });

    it('Fetch with instance method', async function() {
      let fetchedImage = await new AbstractImage({id}).fetch();
      expect(fetchedImage).to.be.an.instanceof(AbstractImage);
      expect(fetchedImage.filename).to.equal(filename);
    });

    it('Fetch with wrong ID', function() {
      expect(AbstractImage.fetch(0)).to.be.rejected;
    });
  });

  describe('Specific operations', function() {
    it('Get uploader', async function() {
      let currentUser = await User.fetchCurrent();
      let uploadedFile = new UploadedFile({
        storages: [], user:currentUser.id, image: abstractImage.id, ext : '.ext', contentType: 'contentType', path: 'path', originalFilename: 'filename', filename: 'filename'
      });
      uploadedFile = await uploadedFile.save();
      expect(uploadedFile).to.be.an.instanceof(UploadedFile);

      let user = await abstractImage.fetchUploader();
      expect(user.id).to.equal(currentUser.id);


    });

    it.skip('Get image servers', async function() {
      let imageServers = await abstractImage.fetchImageServers();
      expect(imageServers).to.be.instanceof(Array);
      expect(imageServers).to.have.lengthOf.at.least(1);
    });

    it('Get uploaded file', async function() {
      let uploadedFile = await abstractImage.fetchUploadedFile();
      expect(uploadedFile).to.be.instanceof(UploadedFile);
    });
  });

  describe('Update', function() {
    it('Update', async function() {
      let newFilename = utils.randomString();
      abstractImage.filename = newFilename;
      await abstractImage.update();
      expect(abstractImage).to.be.an.instanceof(AbstractImage);
      expect(abstractImage.filename).to.equal(newFilename);
    });
  });

  describe('Delete', function() {
    it('Delete', async function() {
      await AbstractImage.delete(id);
    });

    it('Fetch a deleted element', function() {
      expect(AbstractImage.fetch(id)).to.be.rejected;
    });
  });

  // --------------------

  describe('AbstractImageCollection', function() {
    let totalNb = 0;
    let project;

    before(async function() {
      ({id: project} = await utils.getProject());
    });

    after(async function() {
      await utils.cleanData();
    });

    describe('Fetch', function() {
      it('Fetch the whole collection', async function() {
        let collection = await AbstractImageCollection.fetchAll();
        expect(collection).to.be.an.instanceof(AbstractImageCollection);
        totalNb = collection.length;
      });

      it('Fetch with several requests', async function() {
        let collection = await AbstractImageCollection.fetchAll({nbPerPage: Math.ceil(totalNb/3)});
        expect(collection).to.be.an.instanceof(AbstractImageCollection);
        expect(collection).to.have.lengthOf(totalNb);
      });

      it('Fetch unused', async function() {
        let collection = await AbstractImageCollection.fetchUnused();
        expect(collection).to.be.an.instanceof(AbstractImageCollection);
        expect(collection).to.have.lengthOf.at.most(totalNb);
      });
    });

    describe('Working with the collection', function() {
      it('Iterate through abstract images', async function() {
        let collection = await new AbstractImageCollection({nbPerPage: 10}).fetchPage();
        for(let image of collection) {
          expect(image).to.be.an.instanceof(AbstractImage);
        }
      });

      it('Add an image to the collection', function() {
        let collection = new AbstractImageCollection();
        expect(collection).to.have.lengthOf(0);
        collection.push(new AbstractImage());
        expect(collection).to.have.lengthOf(1);
      });

      it('Add arbitrary object to the collection', function() {
        let collection = new AbstractImageCollection();
        expect(collection.push.bind(collection, {})).to.throw();
      });
    });


    describe('Filtering', function() {
      it('Filter on project', async function() {
        let collection = await AbstractImageCollection.fetchAll({filterKey: 'project', filterValue: project});
        expect(collection).to.have.lengthOf(0);
      });
    });

    describe('Pagination', function() {
      let nbPerPage = 1;

      it('Fetch arbitrary page', async function() {
        let collection = new AbstractImageCollection({nbPerPage});
        await collection.fetchPage(2);
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it('Fetch next page', async function() {
        let collection = new AbstractImageCollection({nbPerPage});
        await collection.fetchNextPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });

      it('Fetch previous page', async function() {
        let collection = new AbstractImageCollection({nbPerPage});
        collection.curPage = 2;
        await collection.fetchPreviousPage();
        expect(collection).to.have.lengthOf(nbPerPage);
      });
    });

  });

});
