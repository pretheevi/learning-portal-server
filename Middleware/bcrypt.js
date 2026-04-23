import bcrypt from 'bcrypt'

class Bcrypt{
  static async hashPassword(req, res, next) {
    const { password } = req.body
    const salt = 10
    const password_hash = await bcrypt.hash(password, salt)
    delete req.body.password
    req.body.password_hash = password_hash
    next()
  }
}

export default Bcrypt
