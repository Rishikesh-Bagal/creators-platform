import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Comment to trigger PR CI

let mongoServer;

describe('Auth Routes', () => {
    // 1. Connect to DB before tests
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const dbUri = mongoServer.getUri();
        await mongoose.connect(dbUri);
    });

    // 2. Clear data after each test
    afterEach(async () => {
        await User.deleteMany({});
    });

    // 3. Close connection after all tests
    afterAll(async () => {
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('test@example.com');
        });

        test('should fail if user already exists', async () => {
            // Pre-create a user
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'test@example.com',
                    password: 'password456'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe(
  'This email is already registered. Please login or use a different email.'
);
        });

        test('should fail if missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User'
                    // missing email and password
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Please provide name, email, and password');
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login user successfully', async () => {
            // First register a user (manually to avoid route dependency)
            const bcrypt = (await import('bcrypt')).default;
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Login User',
                email: 'login@example.com',
                password: hashedPassword
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('token');
        });

        test('should fail with wrong password', async () => {
            const bcrypt = (await import('bcrypt')).default;
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Login User',
                email: 'login@example.com',
                password: hashedPassword
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });
});
