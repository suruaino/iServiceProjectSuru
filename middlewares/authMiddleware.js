const validateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const errorMessage = { message: 'You must be logged in to access this route' };

    if (!authHeader) {
        return res.status(401).json(errorMessage);
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    if (!token) {
        return res.status(401).json({ message: 'Invalid token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (error, payload) => {
        if (error) {
            return res.status(401).json(errorMessage);
        }

        const user = await User.findOne({ where: { id: payload.id } });
        if (!user) {
            return res.status(401).json({ message: 'User not found or not logged in' });
        }

        req.user = user;
        next();
    });
};


module.exports = {validateToken};