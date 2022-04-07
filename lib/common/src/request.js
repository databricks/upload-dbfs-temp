"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequest = void 0;
const https_1 = __importDefault(require("https"));
// Logic copied & coverted from https://nodejs.dev/learn/making-http-requests-with-nodejs
const httpRequest = (hostname, path, method, headers, reqBody) => __awaiter(void 0, void 0, void 0, function* () {
    const requestBody = JSON.stringify(reqBody);
    headers['Content-Type'] = headers['Content-Type']
        ? headers['Content-Type']
        : 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestBody);
    const options = {
        hostname,
        path,
        method,
        headers
    };
    return new Promise((resolve, reject) => {
        let result = '';
        const req = https_1.default.request(options, res => {
            res.on('data', chunk => {
                result += chunk;
            });
            res.on('error', err => {
                reject(err);
            });
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(result));
                    }
                    else {
                        reject(new Error(result));
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', err => {
            reject(err);
        });
        if (reqBody) {
            req.write(requestBody);
        }
        req.end();
    });
});
exports.httpRequest = httpRequest;
