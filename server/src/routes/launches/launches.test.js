const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../utils/mongo');

describe('Test Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  describe('Test GET /launches', () => {
    it('should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe('Test POST /launches', () => {
    const completeLaunchData = {
      mission: 'ABC Enterprise',
      rocket: 'ABC XYZ 10101',
      target: 'Kepler-62 f',
      launchDate: '28 January, 2030',
    };

    const launchDataWithoutDate = {
      mission: 'ABC Enterprise',
      rocket: 'ABC XYZ 10101',
      target: 'Kepler-62 f',
    };

    it('should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    it('should catch missing required properties and respond with 400', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    it('should catch invalid launch dates and respond with 400', async () => {
      const body = { ...launchDataWithoutDate, launchDate: 'abcc' };
      const response = await request(app)
        .post('/v1/launches')
        .send(body)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toStrictEqual({
        error: 'Invalid Launch Date',
      });
    });
  });

  afterAll(async () => {
    await mongoDisconnect();
  });
});
