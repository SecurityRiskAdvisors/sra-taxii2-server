const request = require('supertest');
const app = require('../../index');

// this doesnt work yet

const url = 'https://127.0.0.1:3001';
describe('Test the root path', () => {
    test('it responds with taxii discovery data', async () => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const response = await request(url)
            .get('/taxii')
            .auth('admin@example.com', 'admin');
        expect(response.statusCode).toBe(200);
    });
})