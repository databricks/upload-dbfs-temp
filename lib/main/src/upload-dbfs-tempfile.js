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
exports.uploadDbfsTempfile = void 0;
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const api_client_1 = require("../../common/src/api-client");
const getDbfsUploadDirectory = (dbfsTmpDir) => {
    const baseDir = dbfsTmpDir.endsWith('/') ? dbfsTmpDir : `${dbfsTmpDir}/`;
    return `${baseDir}${(0, crypto_1.randomUUID)()}`;
};
function uploadDbfsTempfile(databricksHost, databricksToken, localPath, dbfsTmpDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!dbfsTmpDir.startsWith('dbfs:/')) {
            throw new Error(`Got invalid dbfs-temp-dir input "${dbfsTmpDir}". dbfs-temp-dir input must start with "dbfs:/"`);
        }
        const dbfsUploadDirectory = getDbfsUploadDirectory(dbfsTmpDir);
        const dbfsPath = `${dbfsUploadDirectory}/${path.basename(localPath)}`;
        const apiClient = new api_client_1.ApiClient(databricksHost, databricksToken);
        yield apiClient.dbfsUpload(localPath, dbfsPath);
        return { dbfsUploadDirectory, dbfsUploadPath: dbfsPath };
    });
}
exports.uploadDbfsTempfile = uploadDbfsTempfile;
