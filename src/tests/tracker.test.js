import request from 'supertest'
import app from '../src/app.js'
import * as userRepository from '../src/repositories/user.repository.js'
import * as trackerRepository from '../src/repositories/tracker.repository.js'

jest.mock('../src/repositories/user.repository.js')
jest.mock('../src/repositories/tracker.repository.js')

describe('Tracker Endpoints', () => {
  let token

  beforeEach(async () => {
    jest.clearAllMocks()

    const mockUser = {
      id: 'mock-uuid',
      name: 'Teste',
      email: 'teste@email.com',
      password_hash: '$2a$10$V0g2RfZi1D4iUdfS.hKkDu46yG7uR04X3f/Kk5wF5NnpxiLpXqf1a', // mockup de senha 123456
      current_xp: 0,
      level: 1,
      lives: 5,
      streak_count: 0,
      last_activity_date: null
    }

    userRepository.findUserByEmail.mockImplementation(async (email) => {
      if (email === 'teste@email.com') return mockUser
      return null
    })
    userRepository.createUser.mockResolvedValue(mockUser)
    userRepository.findUserById.mockResolvedValue(mockUser)
    userRepository.updateUser.mockImplementation(async (u) => u)

    await request(app)
      .post('/auth/register')
      .send({
        name: 'Teste',
        email: 'teste@email.com',
        password: '123456'
      })

    const login = await request(app)
      .post('/auth/login')
      .send({
        email: 'teste@email.com',
        password: '123456'
      })

    token = login.body.data.token 
  })

  it('Deve adicionar hábito e ganhar XP', async () => {
    trackerRepository.findHabit.mockResolvedValue(null)
    trackerRepository.createHabit.mockResolvedValue({
      id: 'habit-uuid',
      user_id: 'mock-uuid',
      date: '2026-02-15',
      type: 'leitura',
      xp_earned: 20,
      completed: true
    })

    const response = await request(app)
      .post('/tracker/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-02-15',
        type: 'leitura'
      })

    expect(response.statusCode).toBe(200)
  })
})