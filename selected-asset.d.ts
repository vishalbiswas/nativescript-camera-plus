import { ImageAsset } from 'tns-core-modules/image-asset';
import { ImageSource } from 'tns-core-modules/image-source';
export declare class SelectedAsset extends ImageAsset {
    private _uri;
    private _thumb;
    private _thumbRequested;
    private _thumbAsset;
    private _fileUri;
    private _data;
    constructor(uri: android.net.Uri);
    data(): Promise<any>;
    getImage(options?: {
        maxWidth: number;
        maxHeight: number;
    }): Promise<ImageSource>;
    getImageData(): Promise<ArrayBuffer>;
    readonly thumb: ImageSource;
    readonly thumbAsset: ImageAsset;
    protected setThumbAsset(value: ImageAsset): void;
    readonly uri: string;
    readonly fileUri: string;
    private static _calculateFileUri;
    private static getDataColumn;
    private static isExternalStorageDocument;
    private static isDownloadsDocument;
    private static isMediaDocument;
    private decodeThumbUri;
    private decodeThumbAssetUri;
    private getSampleSize;
    private matchesSize;
    private decodeUri;
    private decodeUriForImageAsset;
    private getByteBuffer;
    private openInputStream;
    private static getContentResolver;
}
