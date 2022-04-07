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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDbfsTmpdir = void 0;
const api_client_1 = require("../../common/src/api-client");
function deleteDbfsTmpdir(databricksHost, databricksToken, dbfsTmpDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiClient = new api_client_1.ApiClient(databricksHost, databricksToken);
        yield apiClient.dbfsDeleteDirectory(dbfsTmpDir);
    });
}
exports.deleteDbfsTmpdir = deleteDbfsTmpdir;
