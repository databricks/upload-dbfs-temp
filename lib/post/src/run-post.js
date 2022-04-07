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
exports.runPost = void 0;
const core = __importStar(require("@actions/core"));
const constants_1 = require("../../common/src/constants");
const util = __importStar(require("../../common/src/utils"));
const delete_dbfs_tmpdir_1 = require("./delete-dbfs-tmpdir");
function runPostHelper() {
    return __awaiter(this, void 0, void 0, function* () {
        const databricksHost = util.getDatabricksHost();
        const databricksToken = util.getDatabricksToken();
        const dbfsTmpdir = core.getState(constants_1.DBFS_TMP_DIR_STATE_KEY);
        yield (0, delete_dbfs_tmpdir_1.deleteDbfsTmpdir)(databricksHost, databricksToken, dbfsTmpdir);
    });
}
function runPost() {
    return __awaiter(this, void 0, void 0, function* () {
        yield util.runStepAndHandleFailure(runPostHelper);
    });
}
exports.runPost = runPost;
