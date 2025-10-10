export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body;

    // 비밀번호가 제공되지 않은 경우
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password is required' 
      });
    }

    // 환경 변수에서 저장된 비밀번호 가져오기
    const storedPassword = process.env.EDIT_PASSWORD;

    // 환경 변수가 설정되지 않은 경우
    if (!storedPassword) {
      console.error('EDIT_PASSWORD environment variable is not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

    // 비밀번호 비교
    const isPasswordValid = password === storedPassword;

    return res.status(200).json({ 
      success: isPasswordValid 
    });

  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
