import { Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const Register: RequestHandler = async(req,res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        res.status(400).json({ message: 'Email, password, and username are required.' });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return;
    }
    const existingUser = await prisma.user.findUniqueOrThrow({
        where: { email: String(email) },
    });

    if (existingUser) {
        res.status(409).json({ message: 'User already exists.' });
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 50);
    await prisma.user.create({
        data: {
            userName: username,
            email: String(email),
            password: hashedPassword,
        },
    });

    res.status(201).json({ message: 'User registered successfully.' });
}

export const Login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    const user = await prisma.user.findUnique({
        where: { email: String(email) },
    });
    if (!user) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '6h' }
    );
    res.status(200).json({ token });
};

export const CheckToken: RequestHandler = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ valid: true, expired: false, decoded });
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.json({ valid: false, expired: true });
        } else {
            res.status(401).json({ valid: false, expired: false, message: 'Invalid token.' });
        }
    }
};
