import { writeFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path = null, content = null } = req.query;
    if (!(path && content)) {
        res.status(400).json({ name: 'no path or filedata provided' })
    } else {
        // your file content here
        writeFileSync(`tmp/${path}`, content);
        res.json({
            path,
            content
        })
    }
}