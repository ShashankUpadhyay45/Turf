import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  // Mock DB User creation
  const user = { id: 'u1', email: data.email, role: 'user', name: data.name, password: hashedPassword };
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  return { user, token };
};

export const login = async (data: any) => {
  // Mock DB User validation
  const user = { id: 'u1', email: data.email, role: 'user', name: 'Test User', password: await bcrypt.hash('password123', 10) };
  
  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  return { user, token };
};

export const getMe = async (userId: string) => {
  return { id: userId, name: 'Test User', email: 'test@example.com' };
};

export const updatePreferences = async (userId: string, prefs: any) => {
  return { id: userId, prefs };
};
