export declare class ApiClient {
    host: string;
    token: string;
    actionVerson: string;
    constructor(host: string, token: string);
    private request;
    private static base64Encode;
    private dbfsCreateHandle;
    private dbfsCloseHandle;
    private dbfsAddFileBlocks;
    dbfsUpload(localPath: string, dbfsPath: string): Promise<void>;
    dbfsDeleteDirectory(dbfsPath: string): Promise<void>;
}
//# sourceMappingURL=api-client.d.ts.map