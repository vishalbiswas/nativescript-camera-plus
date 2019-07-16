import { ContentView } from 'tns-core-modules/ui/content-view';
import { CameraPlus as CameraPlusDefinition } from '.';
export declare class CameraUtil {
    static debug: boolean;
}
export declare const CLog: (...args: any[]) => void;
export declare type CameraTypes = 'front' | 'rear';
export declare abstract class CameraPlusBase extends ContentView implements CameraPlusDefinition {
    debug: boolean;
    events: any;
    static enableVideo: boolean;
    static defaultCamera: CameraTypes;
    static errorEvent: string;
    static photoCapturedEvent: string;
    static toggleCameraEvent: string;
    static parametersSetEvent: string;
    static imagesSelectedEvent: string;
    static videoRecordingStartedEvent: string;
    static videoRecordingFinishedEvent: string;
    static videoRecordingReadyEvent: string;
    static confirmScreenShownEvent: string;
    static confirmScreenDismissedEvent: string;
    confirmPhotos: boolean;
    confirmRetakeText?: string;
    confirmSaveText?: string;
    confirmVideo: boolean;
    saveToGallery: boolean;
    galleryPickerMode: 'single' | 'multiple';
    showFlashIcon: boolean;
    showToggleIcon: boolean;
    showCaptureIcon: boolean;
    showGalleryIcon: boolean;
    flashOnIcon: string;
    flashOffIcon: string;
    toggleCameraIcon: string;
    takePicIcon: string;
    galleryIcon: string;
    autoFocus: boolean;
    doubleTapCameraSwitch: boolean;
    autoSquareCrop: boolean;
    toggleCamera(): void;
    toggleFlash(): void;
    getFlashMode(): string;
    chooseFromLibrary(options?: IChooseOptions): Promise<any>;
    takePicture(options?: ICameraOptions): void;
    record(options?: IVideoOptions): void;
    stop(): void;
    isCameraAvailable(): boolean;
    getCurrentCamera(): 'rear' | 'front';
    requestCameraPermissions(explanationText?: string): Promise<boolean>;
    hasCameraPermission(): boolean;
    requestStoragePermissions(explanationText?: string): Promise<boolean>;
    hasStoragePermissions(): boolean;
    requestAudioPermissions(explanationText?: string): Promise<boolean>;
    hasAudioPermission(): boolean;
    requestVideoRecordingPermissions(explanationText?: string): Promise<boolean>;
    hasVideoRecordingPermissions(): boolean;
    getNumberOfCameras(): number;
    hasFlash(): boolean;
    sendEvent(eventName: string, data?: any, msg?: string): void;
}
export interface ICameraOptions {
    confirm?: boolean;
    saveToGallery?: boolean;
    keepAspectRatio?: boolean;
    height?: number;
    width?: number;
    autoSquareCrop?: boolean;
    confirmRetakeText?: string;
    confirmSaveText?: string;
}
export interface IChooseOptions {
    width?: number;
    height?: number;
    keepAspectRatio?: boolean;
    showImages?: boolean;
    showVideos?: boolean;
}
export interface ICameraPlusEvents {
    photoCapturedEvent: any;
    toggleCameraEvent: any;
    parametersSetEvent: any;
    imagesSelectedEvent: any;
    videoRecordingStartedEvent: any;
    videoRecordingFinishedEvent: any;
    videoRecordingReadyEvent: any;
    confirmScreenShownEvent: any;
    confirmScreenDismissedEvent: any;
}
export declare enum CameraVideoQuality {
    MAX_480P = "480p",
    MAX_720P = "720p",
    MAX_1080P = "1080p",
    MAX_2160P = "2160p",
    HIGHEST = "highest",
    LOWEST = "lowest",
    QVGA = "qvga"
}
export interface IVideoOptions {
    quality?: CameraVideoQuality;
    confirm?: boolean;
    saveToGallery?: boolean;
    height?: number;
    width?: number;
    disableHEVC?: boolean;
}
export declare function GetSetProperty(): (target: any, propertyKey: string) => void;
