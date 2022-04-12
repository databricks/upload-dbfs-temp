"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("./constants");
const request_1 = require("./request");
const fs = __importStar(require("fs"));
// Copying from https://github.com/databricks/databricks-cli/blob/1e39ccfdbab47ee2ca7f320b81146e2bcabb2f97/databricks_cli/sdk/api_client.py
class ApiClient {
    constructor(host, token) {
        this.host = host;
        this.token = token;
        this.actionVerson = require('../../../package.json').version;
    }
    request(path, method, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                Authorization: `Bearer ${this.token}`,
                'User-Agent': `databricks-github-action-upload-dbfs-temp/${this.actionVerson}`,
                'Content-Type': 'application/json'
            };
            return (0, request_1.httpRequest)(this.host, path, method, headers, body);
        });
    }
    static base64Encode(content) {
        if (content instanceof buffer_1.Buffer) {
            return content.toString('base64');
        }
        return new buffer_1.Buffer(content).toString('base64');
    }
    dbfsCreateHandle(dbfsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { handle } = (yield this.request('/api/2.0/dbfs/create', 'POST', {
                path: dbfsPath
            }));
            return handle;
        });
    }
    dbfsCloseHandle(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('/api/2.0/dbfs/close', 'POST', {
                handle
            });
        });
    }
    dbfsAddFileBlocks(handle, localPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = fs.createReadStream(localPath, {
                // Do not set encoding in order to read local path in raw binary format.
                highWaterMark: constants_1.DBFS_UPLOAD_MAX_BYTES_PER_BLOCK
            });
            return new Promise((resolve, reject) => {
                stream.on('data', (content) => __awaiter(this, void 0, void 0, function* () {
                    const b64Content = ApiClient.base64Encode(content);
                    try {
                        yield this.request('/api/2.0/dbfs/add-block', 'POST', {
                            handle,
                            data: b64Content
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                }));
                stream.on('error', err => {
                    reject(err);
                });
                stream.on('close', () => {
                    resolve();
                });
            });
        });
    }
    dbfsUpload(localPath, dbfsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const handle = yield this.dbfsCreateHandle(dbfsPath);
            try {
                yield this.dbfsAddFileBlocks(handle, localPath);
            }
            finally {
                yield this.dbfsCloseHandle(handle);
            }
        });
    }
    dbfsDeleteDirectory(dbfsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.request('/api/2.0/dbfs/delete', 'POST', {
                path: dbfsPath,
                recursive: true
            });
        });
    }
}
exports.ApiClient = ApiClient;
