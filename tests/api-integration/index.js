const request = require('supertest');
const app = require('../../index');
const fs = require('fs');
const mongoose = require('mongoose');

const sslCertDir = process.env.CERT_DIR.replace(/^(.+?)\/*?$/, "$1");
const cert = fs.readFileSync(sslCertDir + '/ca-crt.pem');

// change the certs/ca and hostname to docker container name
const url = 'https://sra-taxii2-server:3001';

const defaultUser = 'admin@example.com';
const defaultPass = 'admin';

afterAll(async () => {
    await mongoose.disconnect();
});

describe('TAXII2 Basic API Functionality', () => {
    test('it doesnt let an unauthenticated user view by default', async () => {
        const response = await request(url)
            .get('/taxii')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert);
        expect(response.statusCode).toBe(401);
    });

    test('it wont login a user with a bad password', async () => {
        const response = await request(url)
            .get('/taxii')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, 'nottherightpassword');
        expect(response.statusCode).toBe(401);
    });

    test('it responds with correct taxii discovery data', async () => {
        const response = await request(url)
            .get('/taxii')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(process.env.TAXII_TITLE);
        expect(response.body.default).toBe(url + '/apiroot1');
        expect(response.body.api_roots).toContain(url + '/apiroot1');
        expect(response.body.description).toBe(process.env.TAXII_DESCRIPTION);
        expect(response.body.contact).toBe(process.env.TAXII_CONTACT);
    });

    test('it returns 404 if you try to access a non-existent API root', async () => {
        const response = await request(url)
            .get('/nopenotanapiroot')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(404);
    });

    test('it responds with correct apiroot data for apiroot1', async () => {
        const response = await request(url)
            .get('/apiroot1')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('apiroot1');
        expect(response.body.description).toBe('enterprise-attack and testing');
        expect(response.body.versions).toContain('taxii-2.0');
        expect(response.body.max_content_length).toBe(9765625);
    });

    test('it responds with a list of collections for apiroot1 including enterprise-attack', async () => {
        const response = await request(url)
            .get('/apiroot1/collections')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(200);

        let collections = response.body.collections;
        let filteredCollections = collections.filter((col) => col.id == "9ee8a9b3-da1b-45d1-9cf6-8141f7039f82");
        let attackCollection = filteredCollections[0];
        expect(attackCollection.title).toBe("enterprise-attack");
        expect(attackCollection.description).toBe("STIX 2.0 ATT&CK content from https://github.com/mitre/cti/tree/master/enterprise-attack");
        expect(attackCollection.can_write).toBeTruthy();
        expect(attackCollection.can_read).toBeTruthy();
    });

    test('it lists details of a specified collection', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(200);

        expect(response.body.title).toBe("enterprise-attack");
        expect(response.body.description).toBe("STIX 2.0 ATT&CK content from https://github.com/mitre/cti/tree/master/enterprise-attack");
        expect(response.body.can_write).toBeTruthy();
        expect(response.body.can_read).toBeTruthy();
    });

    test('it lists objects for a specified collection', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        let testObj = response.body.objects[0];

        expect(testObj.name).toEqual(expect.any(String));
        expect(testObj.id).toEqual(expect.any(String));
        expect(testObj.created).toEqual(expect.any(String));
        expect(testObj.modified).toEqual(expect.any(String));
        expect(testObj.type).toEqual(expect.any(String));
    });

    test('it returns object details for a specified object in a collection', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects/course-of-action--c085476e-1964-4d7f-86e1-d8657a7741e8')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(200);

        let testObj = response.body['course-of-actions'][0];

        expect(testObj.name).toEqual('Accessibility Features Mitigation');
        expect(testObj.description).toEqual("To use this technique remotely, an adversary must use it in conjunction with RDP. Ensure that Network Level Authentication is enabled to force the remote desktop session to authenticate before the session is created and the login screen displayed. It is enabled by default on Windows Vista and later. (Citation: TechNet RDP NLA)\n\nIf possible, use a Remote Desktop Gateway to manage connections and security configuration of RDP within a network. (Citation: TechNet RDP Gateway)\n\nIdentify and block potentially malicious software that may be executed by an adversary with this technique by using whitelisting (Citation: Beechey 2010) tools, like AppLocker, (Citation: Windows Commands JPCERT) (Citation: NSA MS AppLocker) or Software Restriction Policies (Citation: Corio 2008) where appropriate. (Citation: TechNet Applocker vs SRP)");
        expect(testObj.created).toEqual("2018-04-18T17:59:24.739Z");
        expect(testObj.modified).toEqual("2018-04-18T17:59:24.739Z");
        expect(testObj.type).toEqual("course-of-action");
    });

    test('it returns manifest data for a collection', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/manifest')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        let testObj = response.body.objects[0];

        expect(testObj.id).toEqual(expect.any(String));
        expect(testObj.versions[0]).toEqual(expect.any(String));
        expect(testObj.media_types[0]).toEqual(expect.any(String));
        expect(testObj.date_added).toEqual(expect.any(String));
    });

    test('it returns the number of results from the manifest operation specified by the range header', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/manifest')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .set('Range', 'items=10-30')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        expect(response.header['content-range']).toContain('items 10-30');
        expect(response.body['objects'].length).toEqual(21);
    });

    test('it returns the number of results from the collection objects operation specified by the range header', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .set('Range', 'items=40-50')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        expect(response.header['content-range']).toContain('items 40-50');
        expect(response.body['objects'].length).toEqual(11);
    });

    test('it handles the taxii range header spec that doesnt exactly match RFC7233', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .set('Range', 'items 40-50')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        expect(response.header['content-range']).toContain('items 40-50');
        expect(response.body['objects'].length).toEqual(11);
    });

    test('it filters the results for collection objects by type', async () => {
        const response = await request(url)
            .get('/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects?match[type]=attack-pattern')
            .set('Accept', 'application/vnd.oasis.stix+json; version=2.0,application/vnd.oasis.taxii+json; version=2.0')
            .ca(cert)
            .auth(defaultUser, defaultPass);

        expect(response.statusCode).toBe(206);

        expect(response.body['objects'].length).toBeGreaterThan(20);
        expect(response.body['objects'][0].type).toEqual("attack-pattern");
        expect(response.body['objects'][10].type).toEqual("attack-pattern");
        expect(response.body['objects'][20].type).toEqual("attack-pattern");
    });
})
