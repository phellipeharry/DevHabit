import request from 'supertest'
import app from '../src/app.js'
import * as userRepository from '../src/repositories/user.repository.js'

jest.mock('../src/repositories/user.repository.js')

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Deve registrar um novo usuário', async () => {
    userRepository.findUserByEmail.mockResolvedValue(null)
    userRepository.createUser.mockResolvedValue({
      id: 'mock-uuid',
      name: 'Matheus',
      email: 'matheus@email.com',
      password_hash: 'hashed',
      current_xp: 0,
      level: 1,
      lives: 5,
      streak_count: 0
    })

    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'Matheus',
        email: 'matheus@email.com',
        password: '123456'
      })

    expect(response.statusCode).toBe(201)
  })
})
