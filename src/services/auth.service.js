import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { AppError } from '../errors/app-error.js'
import {
  findUserByEmail,
  createUser
} from '../repositories/user.repository.js'

export async function registerUser({ name, email, password }) {
  const userExists = await findUserByEmail(email)

  if (userExists) {
    throw new AppError('Email already exists', 400)
  }

  const password_hash = await bcrypt.hash(password, 10)

  const newUser = {
    id: uuid(),
    name,
    email,
    password_hash,
    avatar_url: null,
    current_xp: 0,
    level: 1,
    lives: 5,
    streak_count: 0,
    last_activity_date: null
  }

  const createdUser = await createUser(newUser)

  return createdUser
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const validPassword = await bcrypt.compare(password, user.password_hash)

  if (!validPassword) {
    throw new AppError('Invalid password', 401)
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  return { user, token }
}