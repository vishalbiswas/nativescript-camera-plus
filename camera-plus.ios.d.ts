import { CameraPlusBase, CameraTypes, ICameraOptions, IChooseOptions, IVideoOptions } from './camera-plus.common';
export { CameraVideoQuality } from './camera-plus.common';
export declare class SwiftyDelegate extends NSObject implements SwiftyCamViewControllerDelegate {
    static ObjCProtocols: {
        prototype: SwiftyCamViewControllerDelegate;
    }[];
    private _owner;
    static initWithOwner(owner: WeakRef<MySwifty>): SwiftyDelegate;
    swiftyCamDidFailToConfigure(swiftyCam: SwiftyCamViewController): void;
    swiftyCamDidFailToRecordVideo(swiftyCam: SwiftyCamViewController, error: NSError): void;
    swiftyCamNotAuthorized(swiftyCam: SwiftyCamViewController): void;
    swiftyCamSessionDidStopRunning(swiftyCam: SwiftyCamViewController): void;
    swiftyCamSessionDidStartRunning(swiftyCam: SwiftyCamViewController): void;
    swiftyCamDidBeginRecordingVideo(swiftyCam: SwiftyCamViewController, camera: CameraSelection): void;
    swiftyCamDidChangeZoomLevel(swiftyCam: SwiftyCamViewController, zoom: number): void;
    swiftyCamDidFinishProcessVideoAt(swiftyCam: SwiftyCamViewController, url: NSURL): void;
    swiftyCamDidFinishRecordingVideo(swiftyCam: SwiftyCamViewController, camera: CameraSelection): void;
    swiftyCamDidFocusAtPoint(swiftyCam: SwiftyCamViewController, point: CGPoint): void;
    swiftyCamDidSwitchCameras(swiftyCam: SwiftyCamViewController, camera: CameraSelection): void;
    swiftyCamDidTake(swiftyCam: SwiftyCamViewController, photo: UIImage): void;
}
export declare class MySwifty extends SwiftyCamViewController {
    static ObjCExposedMethods: {
        switchCam: {
            returns: interop.Type<void>;
        };
        resetPreview: {
            returns: interop.Type<void>;
        };
        savePhoto: {
            returns: interop.Type<void>;
        };
        snapPicture: {
            returns: interop.Type<void>;
        };
        toggleFlash: {
            returns: interop.Type<void>;
        };
        openGallery: {
            returns: interop.Type<void>;
        };
        recordVideo: {
            returns: interop.Type<void>;
        };
        videoDidFinishSavingWithErrorContextInfo: {
            returns: interop.Type<void>;
            params: any[];
        };
    };
    private _owner;
    private _snapPicOptions;
    private _enableVideo;
    private _videoOptions;
    private _videoPath;
    private _isRecording;
    private _photoToSave;
    private _imageConfirmBg;
    private _flashEnabled;
    private _flashBtn;
    private _swiftyDelegate;
    private _pickerDelegate;
    private _resized;
    static initWithOwner(owner: WeakRef<CameraPlus>, defaultCamera?: CameraTypes): MySwifty;
    cleanup(): void;
    enableVideo: boolean;
    pickerDelegate: any;
    closePicker(): void;
    viewDidLoad(): void;
    doLayout(): void;
    viewDidLayoutSubviews(): void;
    viewDidAppear(animated: boolean): void;
    viewWillAppear(animated: boolean): void;
    snapPicture(options?: ICameraOptions): void;
    recordVideo(options?: IVideoOptions): void;
    didStartRecording(camera: CameraSelection): void;
    recordingReady(path: string): void;
    didFinishRecording(camera: CameraSelection): void;
    videoDidFinishSavingWithErrorContextInfo(path: string, error: NSError, contextInfo: any): void;
    switchCam(): void;
    toggleFlash(): void;
    openGallery(): void;
    tookPhoto(photo: UIImage): void;
    resetPreview(): void;
    savePhoto(): void;
    didSwitchCamera(camera: CameraSelection): void;
    isCameraAvailable(): boolean;
    chooseFromLibrary(options?: IChooseOptions): Promise<any>;
    _addButtons(): void;
    private _flashBtnHandler;
}
export declare class CameraPlus extends CameraPlusBase {
    static useDeviceOrientation: boolean;
    private _swifty;
    private _isIPhoneX;
    enableVideo: boolean;
    private _galleryMax;
    private _galleryPickerWidth;
    private _galleryPickerHeight;
    private _keepAspectRatio;
    constructor();
    private isVideoEnabled;
    createNativeView(): UIView;
    private _onLayoutChangeFn;
    private _onLayoutChangeListener;
    initNativeView(): void;
    disposeNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    readonly isIPhoneX: boolean;
    galleryPickerWidth: number;
    galleryPickerHeight: number;
    keepAspectRatio: boolean;
    galleryMax: number;
    toggleCamera(): void;
    toggleFlash(): void;
    getFlashMode(): 'on' | 'off';
    chooseFromLibrary(options?: IChooseOptions): Promise<any>;
    takePicture(options?: ICameraOptions): void;
    record(options?: IVideoOptions): void;
    stop(): void;
    getCurrentCamera(): 'front' | 'rear';
    isCameraAvailable(): boolean;
    private _detectDevice;
}
