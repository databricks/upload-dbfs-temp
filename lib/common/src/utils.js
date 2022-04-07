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
exports.runStepAndHandleFailure = exports.getLocalPathInput = exports.getDbfsTempDir = exports.getDatabricksToken = exports.getDatabricksHost = void 0;
const core = __importStar(require("@actions/core"));
const getDatabricksHost = () => {
    const hostFromInput = core.getInput('databricks-host');
    const hostFromEnv = process.env['DATABRICKS_HOST'] || '';
    if (!hostFromInput && !hostFromEnv) {
        throw new Error('Either databricks-host action input or DATABRICKS_HOST env variable must be set.');
    }
    else {
        // Host passed as an action input takes president.
        return hostFromInput ? hostFromInput : hostFromEnv;
    }
};
exports.getDatabricksHost = getDatabricksHost;
const getDatabricksToken = () => {
    const tokenFromInput = core.getInput('databricks-token');
    const tokenFromEnv = process.env['DATABRICKS_TOKEN'] || '';
    if (!tokenFromInput && !tokenFromEnv) {
        throw new Error('Either databricks-token action input or DATABRICKS_TOKEN env variable must be set.');
    }
    else {
        // Token passed as an action input takes president.
        return tokenFromInput ? tokenFromInput : tokenFromEnv;
    }
};
exports.getDatabricksToken = getDatabricksToken;
const getDbfsTempDir = () => {
    const res = core.getInput('dbfs-temp-dir');
    if (!res.startsWith('dbfs:/')) {
        throw new Error(`dbfs-temp-dir input must be a DBFS path starting with 'dbfs:/'. Got invalid path ${res}`);
    }
    return res;
};
exports.getDbfsTempDir = getDbfsTempDir;
const getLocalPathInput = () => {
    return core.getInput('local-path', { required: true });
};
exports.getLocalPathInput = getLocalPathInput;
const runStepAndHandleFailure = (runStep) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runStep();
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        throw error;
    }
});
exports.runStepAndHandleFailure = runStepAndHandleFailure;
