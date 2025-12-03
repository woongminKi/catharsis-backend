import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 로그인
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
    }

    const admin = await Admin.findOne({ username, isActive: true });

    if (!admin) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    admin.lastLogin = new Date();
    await admin.save();

    const jwtSecret = process.env.JWT_SECRET || 'catharsis-admin-secret-key';
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 로그인된 관리자 정보
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.admin?.id).select('-password');

    if (!admin) {
      return res.status(404).json({ success: false, message: '관리자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 초기 관리자 생성 (첫 실행시에만 사용)
router.post('/setup', async (req: AuthRequest, res: Response) => {
  try {
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      return res.status(400).json({ success: false, message: '이미 관리자가 존재합니다.' });
    }

    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: '모든 필드를 입력해주세요.' });
    }

    const admin = new Admin({
      username,
      password,
      name,
      role: 'super',
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: '관리자 계정이 생성되었습니다.',
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
