"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL must be defined in .env file');
}
const sql = (0, postgres_1.default)(databaseUrl, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});
exports.default = sql;
//# sourceMappingURL=database.js.map