import { db } from "./db.js";

export const matriculas = (_, res) => {
    const q = "SELECT matricula FROM usuarios";

    db.query(q, (err, data) => {
        if(err) return res.json(err)
        return res.status(200).json(data)
    });
};