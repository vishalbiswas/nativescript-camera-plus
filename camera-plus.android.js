"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var permissions = require("nativescript-permissions");
var app = require("tns-core-modules/application");
var fs = require("tns-core-modules/file-system");
var image_asset_1 = require("tns-core-modules/image-asset");
var platform_1 = require("tns-core-modules/platform");
var types = require("tns-core-modules/utils/types");
var utils = require("tns-core-modules/utils/utils");
require("./async-await");
var camera_plus_common_1 = require("./camera-plus.common");
var CamHelpers = require("./helpers");
var selected_asset_1 = require("./selected-asset");
var view_1 = require("tns-core-modules/ui/core/view/view");
var camera_plus_common_2 = require("./camera-plus.common");
exports.CameraVideoQuality = camera_plus_common_2.CameraVideoQuality;
var REQUEST_VIDEO_CAPTURE = 999;
var WRAP_CONTENT = -2;
var ALIGN_PARENT_TOP = 10;
var ALIGN_PARENT_BOTTOM = 12;
var ALIGN_PARENT_LEFT = 9;
var ALIGN_PARENT_RIGHT = 11;
var CENTER_HORIZONTAL = 14;
var DIRECTORY_PICTURES = 'DIRECTORY_PICTURES';
var DIRECTORY_MOVIES = 'DIRECTORY_MOVIES';
var FOCUS_MODE_AUTO = 'auto';
var FOCUS_MODE_EDOF = 'edof';
var FOCUS_MODE_CONTINUOUS_PICTURE = 'continuous-picture';
var FOCUS_MODE_CONTINUOUS_VIDEO = 'continuous-video';
var FLASH_MODE_ON = 'on';
var FLASH_MODE_OFF = 'off';
var CAMERA_FACING_FRONT = 1;
var CAMERA_FACING_BACK = 0;
var RESULT_CODE_PICKER_IMAGES = 941;
var RESULT_OK = -1;
var CAMERA = function () { return android.Manifest.permission.CAMERA; };
var RECORD_AUDIO = function () { return android.Manifest.permission.RECORD_AUDIO; };
var READ_EXTERNAL_STORAGE = function () { return android.Manifest.permission.READ_EXTERNAL_STORAGE; };
var WRITE_EXTERNAL_STORAGE = function () { return android.Manifest.permission.WRITE_EXTERNAL_STORAGE; };
var DEVICE_INFO_STRING = function () { return "device: " + platform_1.device.manufacturer + " " + platform_1.device.model + " on SDK: " + platform_1.device.sdkVersion; };
var common = require("./camera-plus.common");
global.moduleMerge(common, exports);
var CameraPlus = (function (_super) {
    __extends(CameraPlus, _super);
    function CameraPlus() {
        var _this = _super.call(this) || this;
        _this.autoFocus = true;
        _this.flashOnIcon = 'ic_flash_on_white';
        _this.flashOffIcon = 'ic_flash_off_white';
        _this.toggleCameraIcon = 'ic_switch_camera_white';
        _this.confirmPhotos = true;
        _this.saveToGallery = false;
        _this.takePicIcon = 'ic_camera_alt_white';
        _this.galleryIcon = 'ic_photo_library_white';
        _this.insetButtons = false;
        _this.insetButtonsPercent = 0.1;
        _this._flashBtn = null;
        _this._takePicBtn = null;
        _this._toggleCamBtn = null;
        _this._galleryBtn = null;
        _this.camera = null;
        _this._textureSurface = null;
        _this.flashOnIcon = _this.flashOnIcon ? _this.flashOnIcon : 'ic_flash_on_white';
        _this.flashOffIcon = _this.flashOffIcon ? _this.flashOffIcon : 'ic_flash_off_white';
        _this.toggleCameraIcon = _this.toggleCameraIcon ? _this.toggleCameraIcon : 'ic_switch_camera_white';
        _this.takePicIcon = _this.takePicIcon ? _this.takePicIcon : 'ic_camera_alt_white';
        _this.galleryIcon = _this.galleryIcon ? _this.galleryIcon : 'ic_photo_library_white';
        _this.cameraId = CameraPlus.defaultCamera === 'front' ? CAMERA_FACING_FRONT : CAMERA_FACING_BACK;
        _this._onLayoutChangeListener = _this._onLayoutChangeFn.bind(_this);
        return _this;
    }
    Object.defineProperty(CameraPlus.prototype, "camera", {
        get: function () {
            return this._camera;
        },
        set: function (camera) {
            this._camera = camera;
        },
        enumerable: true,
        configurable: true
    });
    CameraPlus.prototype.isVideoEnabled = function () {
        return this.enableVideo === true || CameraPlus.enableVideo;
    };
    CameraPlus.prototype.createNativeView = function () {
        var _this = this;
        this._nativeView = new android.widget.RelativeLayout(this._context);
        try {
            if (this.isCameraAvailable() === false) {
                camera_plus_common_1.CLog("No Camera on this device.");
                return;
            }
            var that_1 = new WeakRef(this);
            this._owner = that_1;
            permissions.requestPermission(CAMERA()).then(function () {
                _this._textureView = new android.view.TextureView(_this._context);
                if (_this._textureView) {
                    _this._textureView.setFocusable(true);
                    _this._textureView.setFocusableInTouchMode(true);
                    _this._textureView.requestFocus();
                    _this._nativeView.addView(_this._textureView);
                    if (_this.isVideoEnabled()) {
                        _this._mediaRecorder = new android.media.MediaRecorder();
                        camera_plus_common_1.CLog("this._mediaRecorder", _this._mediaRecorder);
                    }
                    _this._textureView.setSurfaceTextureListener(new android.view.TextureView.SurfaceTextureListener({
                        get owner() {
                            return that_1.get();
                        },
                        onSurfaceTextureSizeChanged: function (_, __, ___) { },
                        onSurfaceTextureAvailable: function (surface, width, height) {
                            camera_plus_common_1.CLog("*** onSurfaceTextureAvailable ***\nthis.cameraId = " + _this.cameraId);
                            _this._surface = surface;
                            _this._textureSurface = new android.view.Surface(surface);
                            var hasPerm = _this.hasCameraPermission();
                            if (hasPerm === true) {
                                _this._initCamera(_this.cameraId);
                                _this._initDefaultButtons();
                            }
                            else {
                                permissions
                                    .requestPermission(CAMERA())
                                    .then(function () {
                                    _this._initCamera(_this.cameraId);
                                    _this._initDefaultButtons();
                                })
                                    .catch(function (err) {
                                    camera_plus_common_1.CLog('Application does not have permission to use CAMERA.', err);
                                    return;
                                });
                            }
                        },
                        onSurfaceTextureDestroyed: function (surface) {
                            _this._releaseCameraAndPreview();
                            return true;
                        },
                        onSurfaceTextureUpdated: function (surface) {
                        }
                    }));
                }
            }, function (err) {
                camera_plus_common_1.CLog('Application does not have permission to use CAMERA.', err);
                return _this._nativeView;
            });
            camera_plus_common_1.CLog('video enabled:', this.isVideoEnabled());
            camera_plus_common_1.CLog('default camera:', CameraPlus.defaultCamera);
        }
        catch (ex) {
            camera_plus_common_1.CLog('createNativeView error', ex);
            this.sendEvent(CameraPlus.errorEvent, ex, 'Error creating the native view.');
        }
        return this._nativeView;
    };
    CameraPlus.prototype._onLayoutChangeFn = function (args) {
        var size = this.getActualSize();
        camera_plus_common_1.CLog('xml width/height:', size.width + 'x' + size.height);
    };
    CameraPlus.prototype.initNativeView = function () {
        this.on(view_1.View.layoutChangedEvent, this._onLayoutChangeListener);
    };
    CameraPlus.prototype.disposeNativeView = function () {
        camera_plus_common_1.CLog('disposeNativeView.');
        this.off(view_1.View.layoutChangedEvent, this._onLayoutChangeListener);
        _super.prototype.disposeNativeView.call(this);
    };
    CameraPlus.prototype.takePicture = function (options) {
        var _this = this;
        try {
            camera_plus_common_1.CLog(JSON.stringify(options));
            var hasCamPerm = this.hasCameraPermission();
            if (!hasCamPerm) {
                camera_plus_common_1.CLog('Application does not have permission to use Camera.');
                return;
            }
            this.camera.takePicture(null, null, new android.hardware.Camera.PictureCallback({
                onPictureTaken: function (data, camera) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (data === null) {
                            camera_plus_common_1.CLog("No image data from the Camera onPictureTaken callback.");
                            return [2];
                        }
                        this._onPictureTaken(options, data);
                        return [2];
                    });
                }); }
            }));
        }
        catch (e) {
            camera_plus_common_1.CLog('takePicture error', e);
            this.sendEvent(CameraPlus.errorEvent, e, 'Error taking picture.');
            return;
        }
    };
    CameraPlus.prototype.releaseCamera = function () {
        if (this.camera !== null) {
            this.camera.release();
            this.camera = null;
        }
    };
    CameraPlus.prototype.toggleCamera = function () {
        try {
            var camNumber = this.getNumberOfCameras();
            if (camNumber <= 1) {
                camera_plus_common_1.CLog("Android Device has " + camNumber + " camera.");
                return;
            }
            if (this.camera === null) {
                return;
            }
            if (this.camera !== null) {
                this.camera.stopPreview();
                this.camera.release();
                this.camera = null;
            }
            if (this.cameraId === CAMERA_FACING_FRONT) {
                this.cameraId = CAMERA_FACING_BACK;
            }
            else {
                this.cameraId = CAMERA_FACING_FRONT;
            }
            this.camera = android.hardware.Camera.open(this.cameraId);
            this._setCameraDisplayOrientation(app.android.foregroundActivity, this.cameraId, this.camera);
            this.camera.setPreviewTexture(this._surface);
            this.camera.startPreview();
            this.sendEvent(CameraPlus.toggleCameraEvent, this.camera);
            this._ensureCorrectFlashIcon();
            this._ensureFocusMode();
        }
        catch (ex) {
            camera_plus_common_1.CLog(ex);
            this.sendEvent(CameraPlus.errorEvent, ex, 'Error trying to toggle camera.');
        }
    };
    CameraPlus.prototype.record = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var permResult, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.isVideoEnabled()) return [3, 2];
                        return [4, this.requestVideoRecordingPermissions()];
                    case 1:
                        permResult = _a.sent();
                        camera_plus_common_1.CLog(permResult);
                        if (this.isRecording) {
                            camera_plus_common_1.CLog('CameraPlus stop video recording.');
                            this.stopRecording();
                        }
                        else {
                            camera_plus_common_1.CLog('CameraPlus record video options:', options);
                            if (options) {
                                this._videoOptions = options;
                            }
                            else {
                                this._videoOptions = {
                                    confirm: this._owner.get().confirmVideo,
                                    saveToGallery: this._owner.get().saveToGallery
                                };
                            }
                            this._prepareVideoRecorder(this._videoOptions);
                        }
                        _a.label = 2;
                    case 2: return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        camera_plus_common_1.CLog(err_1);
                        this.sendEvent(CameraPlus.errorEvent, err_1, 'Error trying to record video.');
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    CameraPlus.prototype.stop = function () {
        if (this.isVideoEnabled()) {
            this.stopRecording();
        }
    };
    CameraPlus.prototype.stopRecording = function () {
        try {
            if (this.camera && this._mediaRecorder && this.isRecording) {
                camera_plus_common_1.CLog("*** stopping mediaRecorder ***");
                this._owner.get().sendEvent(CameraPlus.videoRecordingReadyEvent, this._videoPath);
                this._mediaRecorder.stop();
                this._releaseMediaRecorder();
                camera_plus_common_1.CLog("Recording complete");
                this.isRecording = false;
            }
        }
        catch (err) {
            camera_plus_common_1.CLog("stopRecording error", err);
            this.sendEvent(CameraPlus.errorEvent, err, 'Error trying to stop recording.');
            this._releaseMediaRecorder();
            this.isRecording = false;
        }
    };
    CameraPlus.prototype._getCamcorderProfile = function (cameraId, quality) {
        var CamcorderProfile = android.media.CamcorderProfile;
        var profile;
        switch (quality) {
            case camera_plus_common_1.CameraVideoQuality.MAX_720P:
                if (CamcorderProfile.hasProfile(cameraId, CamcorderProfile.QUALITY_720P)) {
                    profile = camera_plus_common_1.CameraVideoQuality.MAX_720P;
                }
                else {
                    profile = this._getCamcorderProfile(cameraId, camera_plus_common_1.CameraVideoQuality.MAX_480P);
                }
                break;
            case camera_plus_common_1.CameraVideoQuality.MAX_1080P:
                if (CamcorderProfile.hasProfile(cameraId, CamcorderProfile.QUALITY_1080P)) {
                    profile = camera_plus_common_1.CameraVideoQuality.MAX_1080P;
                }
                else {
                    profile = this._getCamcorderProfile(cameraId, camera_plus_common_1.CameraVideoQuality.MAX_720P);
                }
                break;
            case camera_plus_common_1.CameraVideoQuality.MAX_2160P:
                try {
                    CamcorderProfile.get(CamcorderProfile.QUALITY_2160P);
                    profile = camera_plus_common_1.CameraVideoQuality.MAX_2160P;
                }
                catch (e) {
                    profile = camera_plus_common_1.CameraVideoQuality.HIGHEST;
                }
                break;
            case camera_plus_common_1.CameraVideoQuality.HIGHEST:
                profile = camera_plus_common_1.CameraVideoQuality.HIGHEST;
                break;
            case camera_plus_common_1.CameraVideoQuality.LOWEST:
                profile = camera_plus_common_1.CameraVideoQuality.LOWEST;
                break;
            case camera_plus_common_1.CameraVideoQuality.QVGA:
                if (CamcorderProfile.hasProfile(cameraId, CamcorderProfile.QUALITY_QVGA)) {
                    profile = camera_plus_common_1.CameraVideoQuality.QVGA;
                }
                else {
                    profile = camera_plus_common_1.CameraVideoQuality.LOWEST;
                }
                break;
            default:
                if (CamcorderProfile.hasProfile(cameraId, CamcorderProfile.QUALITY_480P)) {
                    profile = camera_plus_common_1.CameraVideoQuality.MAX_480P;
                }
                else {
                    profile = this._getCamcorderProfile(cameraId, camera_plus_common_1.CameraVideoQuality.QVGA);
                }
                break;
        }
        return profile;
    };
    CameraPlus.prototype._prepareVideoRecorder = function (options) {
        var _this = this;
        if (!this._mediaRecorder) {
            this._mediaRecorder = new android.media.MediaRecorder();
            camera_plus_common_1.CLog("this._mediaRecorder", this._mediaRecorder);
        }
        this.camera.unlock();
        this._mediaRecorder.setCamera(this.camera);
        this._mediaRecorder.setAudioSource(android.media.MediaRecorder.AudioSource.CAMCORDER);
        this._mediaRecorder.setVideoSource(android.media.MediaRecorder.VideoSource.CAMERA);
        var quality;
        var cameraQuality = this._getCamcorderProfile(this.cameraId, options.quality);
        switch (cameraQuality) {
            case camera_plus_common_1.CameraVideoQuality.MAX_2160P:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_2160P);
                break;
            case camera_plus_common_1.CameraVideoQuality.MAX_1080P:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_1080P);
                break;
            case camera_plus_common_1.CameraVideoQuality.MAX_720P:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_720P);
                break;
            case camera_plus_common_1.CameraVideoQuality.HIGHEST:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_HIGH);
                break;
            case camera_plus_common_1.CameraVideoQuality.LOWEST:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_LOW);
                break;
            case camera_plus_common_1.CameraVideoQuality.QVGA:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_QVGA);
                break;
            default:
                quality = android.media.CamcorderProfile.get(this.cameraId, android.media.CamcorderProfile.QUALITY_480P);
                break;
        }
        this._mediaRecorder.setOutputFormat(android.media.MediaRecorder.OutputFormat.MPEG_4);
        this._mediaRecorder.setVideoSize(quality.videoFrameWidth, quality.videoFrameHeight);
        this._mediaRecorder.setAudioChannels(quality.audioChannels);
        var isHevcSupported = !options.disableHEVC && android.os.Build.VERSION.SDK_INT >= 24;
        var videoBitRate = isHevcSupported ? quality.videoBitRate / 2 : quality.videoBitRate;
        this._mediaRecorder.setVideoFrameRate(quality.videoFrameRate);
        this._mediaRecorder.setVideoEncodingBitRate(videoBitRate);
        this._mediaRecorder.setAudioEncodingBitRate(quality.audioBitRate);
        if (isHevcSupported) {
            this._mediaRecorder.setVideoEncoder(android.media.MediaRecorder.VideoEncoder.HEVC);
        }
        else {
            this._mediaRecorder.setVideoEncoder(android.media.MediaRecorder.VideoEncoder.H264);
        }
        this._mediaRecorder.setAudioEncoder(quality.audioCodec);
        var videoPath = this._getOutputMediaFile(2).toString();
        this._videoPath = videoPath;
        camera_plus_common_1.CLog("this._videoPath is " + this._videoPath);
        this._mediaRecorder.setOutputFile(videoPath);
        this._mediaRecorder.setPreviewDisplay(this._textureSurface);
        this._mediaRecorder.setOnErrorListener(new android.media.MediaRecorder.OnErrorListener({
            onError: function (mr, what, extra) {
                _this.sendEvent(CameraPlus.errorEvent, what, 'MediaRecorder error listener.');
                _this._releaseMediaRecorder();
            }
        }));
        try {
            this._mediaRecorder.prepare();
            this._mediaRecorder.start();
            this.isRecording = true;
            this._owner.get().sendEvent(CameraPlus.videoRecordingStartedEvent, this.camera);
        }
        catch (e) {
            camera_plus_common_1.CLog('Exception preparing MediaRecorder', e);
            this._releaseMediaRecorder();
            this.isRecording = false;
        }
    };
    CameraPlus.prototype._getOutputMediaFile = function (type) {
        var dateStamp = CamHelpers.createDateTimeStamp();
        var videoPath;
        var nativeFile;
        var fileName;
        if (this._videoOptions.saveToGallery === true) {
            var hasStoragePerm = this.hasStoragePermissions();
            if (!hasStoragePerm) {
                camera_plus_common_1.CLog("Application does not have storage permission to save file.");
                return null;
            }
            fileName = "VID_" + Date.now() + ".mp4";
            var folderPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).toString() +
                '/Camera/';
            if (!fs.Folder.exists(folderPath)) {
                fs.Folder.fromPath(folderPath);
            }
            videoPath = fs.path.join(folderPath, fileName);
            nativeFile = new java.io.File(videoPath);
        }
        else {
            fileName = "VID_" + Date.now() + ".mp4";
            var sdkVersionInt = parseInt(platform_1.device.sdkVersion);
            if (sdkVersionInt > 21) {
                var folderPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).toString() +
                    '/Camera/';
                if (!fs.Folder.exists(folderPath)) {
                    fs.Folder.fromPath(folderPath);
                }
                videoPath = fs.path.join(folderPath, fileName);
                nativeFile = new java.io.File(videoPath);
                var tempPictureUri = android.support.v4.content.FileProvider.getUriForFile(app.android.currentContext, app.android.nativeApp.getPackageName() + '.provider', nativeFile);
            }
            else {
                var folderPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).toString() +
                    '/Camera/';
                if (!fs.Folder.exists(folderPath)) {
                    fs.Folder.fromPath(folderPath);
                }
                videoPath = fs.path.join(folderPath, fileName);
                nativeFile = new java.io.File(videoPath);
            }
        }
        camera_plus_common_1.CLog("videoPath = " + videoPath);
        camera_plus_common_1.CLog("nativeFile = " + nativeFile);
        camera_plus_common_1.CLog("returning nativeFile = " + nativeFile);
        return nativeFile;
    };
    CameraPlus.prototype._releaseMediaRecorder = function () {
        if (this._mediaRecorder) {
            this._mediaRecorder.reset();
            this._mediaRecorder.release();
            this._mediaRecorder = null;
            this._videoPath = '';
            this.camera.lock();
        }
    };
    CameraPlus.prototype.chooseFromLibrary = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var createThePickerIntent_1 = function () {
                    var intent = new android.content.Intent();
                    intent.setType('*/*');
                    if (!options) {
                        options = {
                            showImages: true,
                            showVideos: _this.isVideoEnabled()
                        };
                    }
                    if (options.showImages === undefined) {
                        options.showImages = true;
                    }
                    if (options.showVideos === undefined) {
                        options.showVideos = true;
                    }
                    var length = 0;
                    if (options.showImages) {
                        length++;
                    }
                    if (options.showVideos) {
                        length++;
                    }
                    var mimetypes = Array.create(java.lang.String, length);
                    var index = 0;
                    if (options.showImages) {
                        mimetypes[index] = 'image/*';
                        index++;
                    }
                    if (options.showVideos) {
                        mimetypes[index] = 'video/*';
                    }
                    intent.putExtra(android.content.Intent.EXTRA_MIME_TYPES, mimetypes);
                    intent.setAction('android.intent.action.GET_CONTENT');
                    if (_this.galleryPickerMode === 'multiple') {
                        intent.putExtra('android.intent.extra.ALLOW_MULTIPLE', true);
                    }
                    var onImagePickerResult = function (args) {
                        if (args.requestCode === RESULT_CODE_PICKER_IMAGES && args.resultCode === RESULT_OK) {
                            try {
                                var selectedImages = [];
                                var data = args.intent;
                                var clipData = data.getClipData();
                                if (clipData !== null) {
                                    for (var i = 0; i < clipData.getItemCount(); i++) {
                                        var clipItem = clipData.getItemAt(i);
                                        var uri = clipItem.getUri();
                                        var selectedAsset = new selected_asset_1.SelectedAsset(uri);
                                        var asset = new image_asset_1.ImageAsset(selectedAsset.android);
                                        selectedImages.push(asset);
                                    }
                                }
                                else {
                                    var uri = data.getData();
                                    var path = uri.getPath();
                                    var selectedAsset = new selected_asset_1.SelectedAsset(uri);
                                    var asset = new image_asset_1.ImageAsset(selectedAsset.android);
                                    selectedImages.push(asset);
                                }
                                app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                                resolve(selectedImages);
                                _this.sendEvent(CameraPlus.imagesSelectedEvent, selectedImages);
                                return;
                            }
                            catch (e) {
                                camera_plus_common_1.CLog(e);
                                app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                                reject(e);
                                _this.sendEvent(CameraPlus.errorEvent, e, 'Error with the image picker result.');
                                return;
                            }
                        }
                        else {
                            app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                            reject("Image picker activity result code " + args.resultCode);
                            return;
                        }
                    };
                    app.android.on(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                    app.android.foregroundActivity.startActivityForResult(intent, RESULT_CODE_PICKER_IMAGES);
                };
                var hasPerm = _this.hasStoragePermissions();
                if (hasPerm === true) {
                    createThePickerIntent_1();
                }
                else {
                    permissions.requestPermissions([READ_EXTERNAL_STORAGE(), WRITE_EXTERNAL_STORAGE()]).then(function () {
                        createThePickerIntent_1();
                    });
                }
            }
            catch (e) {
                reject(e);
                _this.sendEvent(CameraPlus.errorEvent, e, 'Error choosing an image from the device library.');
            }
        });
    };
    CameraPlus.prototype.toggleFlash = function () {
        try {
            if (this.camera === undefined || this.camera === null) {
                camera_plus_common_1.CLog("There is no current camera to toggle flash mode");
                return;
            }
            var params = this.camera.getParameters();
            var currentFlashMode = params.getFlashMode();
            camera_plus_common_1.CLog('currentFlashMode', currentFlashMode);
            if (currentFlashMode === null) {
                return;
            }
            if (currentFlashMode === FLASH_MODE_OFF || currentFlashMode === null) {
                params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_ON);
            }
            else if (currentFlashMode === FLASH_MODE_ON) {
                params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_OFF);
            }
            camera_plus_common_1.CLog("setting flash mode params");
            this.camera.setParameters(params);
            this._ensureCorrectFlashIcon();
        }
        catch (error) {
            camera_plus_common_1.CLog('toggleFlash error', error);
            this.sendEvent(CameraPlus.errorEvent, error, 'Error trying to toggle flash.');
        }
    };
    CameraPlus.prototype.requestCameraPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermission(CAMERA(), explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Camera permissions.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasCameraPermission = function () {
        return permissions.hasPermission(CAMERA());
    };
    CameraPlus.prototype.requestAudioPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermission(RECORD_AUDIO(), explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Audio permission.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasAudioPermission = function () {
        return permissions.hasPermission(RECORD_AUDIO());
    };
    CameraPlus.prototype.requestStoragePermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermissions([WRITE_EXTERNAL_STORAGE(), READ_EXTERNAL_STORAGE()], explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Storage permissions.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasStoragePermissions = function () {
        var writePerm = permissions.hasPermission(WRITE_EXTERNAL_STORAGE());
        var readPerm = permissions.hasPermission(READ_EXTERNAL_STORAGE());
        if (writePerm === true && readPerm === true) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.requestVideoRecordingPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                permissions
                    .requestPermissions([WRITE_EXTERNAL_STORAGE(), RECORD_AUDIO()], explanation)
                    .then(function () {
                    resolve(true);
                })
                    .catch(function (err) {
                    _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Video permissions.');
                    reject(false);
                });
                return [2];
            });
        }); });
    };
    CameraPlus.prototype.hasVideoRecordingPermissions = function () {
        var writePerm = permissions.hasPermission(WRITE_EXTERNAL_STORAGE());
        var audio = permissions.hasPermission(RECORD_AUDIO());
        if (writePerm === true && audio === true) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.getCurrentCamera = function () {
        if (this.cameraId === CAMERA_FACING_FRONT) {
            return 'front';
        }
        else {
            return 'rear';
        }
    };
    CameraPlus.prototype.isCameraAvailable = function () {
        if (utils.ad
            .getApplicationContext()
            .getPackageManager()
            .hasSystemFeature('android.hardware.camera')) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.getNumberOfCameras = function () {
        return android.hardware.Camera.getNumberOfCameras();
    };
    CameraPlus.prototype.hasFlash = function () {
        if (this.camera === null || this.camera === undefined) {
            camera_plus_common_1.CLog("No camera");
            return false;
        }
        var params = this.camera.getParameters();
        var flashModes = params.getSupportedFlashModes();
        if (flashModes === null) {
            return false;
        }
        for (var i = flashModes.size(); i--;) {
            var item = flashModes.get(i);
            if (item === 'on' || item === 'auto') {
                return true;
            }
        }
        return false;
    };
    CameraPlus.prototype.getFlashMode = function () {
        if (this.camera === null || this.camera === undefined) {
            camera_plus_common_1.CLog('no camera');
            return null;
        }
        var params = this.camera.getParameters();
        var supportedFlashModes = params.getSupportedFlashModes();
        camera_plus_common_1.CLog("supported flash modes = " + supportedFlashModes + " --- " + DEVICE_INFO_STRING());
        var currentFlashMode = params.getFlashMode();
        return currentFlashMode;
    };
    CameraPlus.prototype._ensureCorrectFlashIcon = function () {
        var currentFlashMode = this.getFlashMode();
        camera_plus_common_1.CLog('_ensureCorrectFlashIcon flash mode', currentFlashMode);
        if (currentFlashMode === null) {
            if (this._flashBtn) {
                this._flashBtn.setVisibility(android.view.View.GONE);
            }
            return;
        }
        if (this._flashBtn === undefined || this._flashBtn === null) {
            return;
        }
        this._flashBtn.setVisibility(android.view.View.VISIBLE);
        this._flashBtn.setImageResource(android.R.color.transparent);
        var flashIcon = currentFlashMode === FLASH_MODE_OFF ? this.flashOffIcon : this.flashOnIcon;
        var imageDrawable = CamHelpers.getImageDrawable(flashIcon);
        this._flashBtn.setImageResource(imageDrawable);
    };
    CameraPlus.prototype._ensureFocusMode = function () {
        if (this.autoFocus === true && this.camera) {
            var params = this.camera.getParameters();
            var supportedFocusModes = params.getSupportedFocusModes();
            camera_plus_common_1.CLog("supported focus modes = " + supportedFocusModes + " --- " + DEVICE_INFO_STRING());
            if (supportedFocusModes.contains(android.hardware.Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE)) {
                camera_plus_common_1.CLog("setting focus mode to FOCUS_MODE_CONTINUOUS_PICTURE");
                params.setFocusMode(android.hardware.Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
                this.camera.setParameters(params);
            }
            else if (supportedFocusModes.contains(android.hardware.Camera.Parameters.FOCUS_MODE_AUTO)) {
                camera_plus_common_1.CLog("setting focus mode to FOCUS_MODE_AUTO");
                params.setFocusMode(android.hardware.Camera.Parameters.FOCUS_MODE_AUTO);
                this.camera.setParameters(params);
            }
        }
        else if (this.camera) {
            var params = this.camera.getParameters();
            var supportedFocusModes = params.getSupportedFocusModes();
            camera_plus_common_1.CLog("supported focus modes = " + supportedFocusModes + " --- " + DEVICE_INFO_STRING());
            if (supportedFocusModes.contains(android.hardware.Camera.Parameters.FOCUS_MODE_FIXED)) {
                camera_plus_common_1.CLog("setting focus mode to FOCUS_MODE_FIXED");
                params.setFocusMode(android.hardware.Camera.Parameters.FOCUS_MODE_FIXED);
                this.camera.setParameters(params);
            }
        }
    };
    CameraPlus.prototype._initFlashButton = function () {
        var _this = this;
        this._flashBtn = CamHelpers.createImageButton();
        this._ensureCorrectFlashIcon();
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._flashBtn.setBackgroundDrawable(shape);
        this._flashBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.toggleFlash();
                _this._ensureCorrectFlashIcon();
            }
        }));
        var flashParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            flashParams.setMargins(xMargin, yMargin, 8, 8);
        }
        else {
            flashParams.setMargins(8, 8, 8, 8);
        }
        flashParams.addRule(ALIGN_PARENT_TOP);
        flashParams.addRule(ALIGN_PARENT_LEFT);
        this._nativeView.addView(this._flashBtn, flashParams);
    };
    CameraPlus.prototype._initGalleryButton = function () {
        var _this = this;
        this._galleryBtn = CamHelpers.createImageButton();
        var openGalleryDrawable = CamHelpers.getImageDrawable(this.galleryIcon);
        this._galleryBtn.setImageResource(openGalleryDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._galleryBtn.setBackgroundDrawable(shape);
        this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.chooseFromLibrary();
            }
        }));
        var galleryParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            galleryParams.setMargins(xMargin, 8, 8, yMargin);
        }
        else {
            galleryParams.setMargins(8, 8, 8, 8);
        }
        galleryParams.addRule(ALIGN_PARENT_BOTTOM);
        galleryParams.addRule(ALIGN_PARENT_LEFT);
        this._nativeView.addView(this._galleryBtn, galleryParams);
    };
    CameraPlus.prototype._initToggleCameraButton = function () {
        var _this = this;
        this._toggleCamBtn = CamHelpers.createImageButton();
        var switchCameraDrawable = CamHelpers.getImageDrawable(this.toggleCameraIcon);
        this._toggleCamBtn.setImageResource(switchCameraDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._toggleCamBtn.setBackgroundDrawable(shape);
        this._toggleCamBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (view) {
                _this.toggleCamera();
            }
        }));
        var toggleCamParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            toggleCamParams.setMargins(8, yMargin, xMargin, 8);
        }
        else {
            toggleCamParams.setMargins(8, 8, 8, 8);
        }
        toggleCamParams.addRule(ALIGN_PARENT_TOP);
        toggleCamParams.addRule(ALIGN_PARENT_RIGHT);
        this._nativeView.addView(this._toggleCamBtn, toggleCamParams);
    };
    CameraPlus.prototype._initTakePicButton = function () {
        var _this = this;
        this._takePicBtn = CamHelpers.createImageButton();
        var takePicDrawable = CamHelpers.getImageDrawable(this.takePicIcon);
        this._takePicBtn.setImageResource(takePicDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._takePicBtn.setBackgroundDrawable(shape);
        this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                camera_plus_common_1.CLog("The default Take Picture event will attempt to save the image to gallery.");
                var opts = {
                    saveToGallery: true,
                    confirm: _this.confirmPhotos ? true : false,
                    autoSquareCrop: _this.autoSquareCrop
                };
                _this.takePicture(opts);
            }
        }));
        var takePicParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            takePicParams.setMargins(8, 8, 8, yMargin);
        }
        else {
            takePicParams.setMargins(8, 8, 8, 8);
        }
        takePicParams.addRule(ALIGN_PARENT_BOTTOM);
        takePicParams.addRule(CENTER_HORIZONTAL);
        this._nativeView.addView(this._takePicBtn, takePicParams);
    };
    CameraPlus.prototype._initDefaultButtons = function () {
        try {
            if (this.showFlashIcon === true && this.getFlashMode() !== null && this._flashBtn === null) {
                this._initFlashButton();
            }
            if (this.showGalleryIcon === true && this._galleryBtn === null) {
                this._initGalleryButton();
            }
            if (this.showToggleIcon === true && this.getNumberOfCameras() > 1 && this._toggleCamBtn === null) {
                this._initToggleCameraButton();
            }
            if (this.showCaptureIcon === true && this._takePicBtn === null) {
                if (this.showFlashIcon === true && this.getFlashMode() !== null && this._flashBtn === null) {
                    this._initFlashButton();
                }
                if (this.showGalleryIcon === true && this._galleryBtn === null) {
                    this._initGalleryButton();
                }
                if (this.showToggleIcon === true && this.getNumberOfCameras() > 1 && this._toggleCamBtn === null) {
                    this._initToggleCameraButton();
                }
                if (this.showCaptureIcon === true && this._takePicBtn === null) {
                    this._initTakePicButton();
                }
            }
        }
        catch (ex) {
            camera_plus_common_1.CLog('_initDefaultButtons error', ex);
        }
    };
    CameraPlus.prototype._initCamera = function (id) {
        try {
            camera_plus_common_1.CLog("*** _initCamera ***\nthis.cameraId = " + this.cameraId + " --- " + DEVICE_INFO_STRING());
            if (this.camera === null) {
                this.cameraId = CAMERA_FACING_BACK;
            }
            if (id === null || id === undefined) {
                camera_plus_common_1.CLog("opening new camera");
                this.camera = android.hardware.Camera.open();
            }
            else {
                camera_plus_common_1.CLog("opening camera with id = " + id);
                this.camera = android.hardware.Camera.open(id);
            }
            this.sendEvent('loaded', this.camera);
            if (id !== null && id !== undefined) {
                this.cameraId = id;
            }
            else {
                if (this.cameraId === CAMERA_FACING_BACK) {
                    this.cameraId = CAMERA_FACING_BACK;
                }
                else {
                    this.cameraId = CAMERA_FACING_FRONT;
                }
            }
            this._ensureFocusMode();
            this._setCameraDisplayOrientation(app.android.foregroundActivity, this.cameraId, this.camera);
            this.camera.setPreviewTexture(this._surface);
            this.camera.startPreview();
            this._ensureCorrectFlashIcon();
        }
        catch (ex) {
            camera_plus_common_1.CLog('error _initCamera', ex);
        }
    };
    CameraPlus.prototype._setCameraDisplayOrientation = function (activity, cameraId, camera) {
        camera_plus_common_1.CLog("*** _setCameraDisplayOrientation ***");
        var info = new android.hardware.Camera.CameraInfo();
        android.hardware.Camera.getCameraInfo(cameraId, info);
        var params = this.camera.getParameters();
        var rotation = activity
            .getWindowManager()
            .getDefaultDisplay()
            .getRotation();
        camera_plus_common_1.CLog("DISPLAY ROTATION = " + rotation);
        var degrees = 0;
        switch (rotation) {
            case 0:
                degrees = 0;
                break;
            case 1:
                degrees = 90;
                break;
            case 2:
                degrees = 180;
                break;
            case 3:
                degrees = 270;
                break;
        }
        var result;
        if (info.facing === CAMERA_FACING_FRONT) {
            camera_plus_common_1.CLog("--- setting rotation for front facing camera --- \n --- info.orientation = " + info.orientation);
            result = (info.orientation + degrees) % 360;
            result = (360 - result) % 360;
            camera_plus_common_1.CLog("result = " + result);
            var deviceModel = platform_1.device.model.toLowerCase();
            var isNexus6 = deviceModel.indexOf('nexus') > -1 && deviceModel.indexOf('6') > -1;
            if (this.cameraId === CAMERA_FACING_FRONT && isNexus6) {
                params.setRotation(90);
            }
            else {
                params.setRotation(270);
            }
        }
        else {
            camera_plus_common_1.CLog("--- setting rotation for back facing camera --- \n --- info.orientation = " + info.orientation);
            result = (info.orientation - degrees + 360) % 360;
            camera_plus_common_1.CLog("result = " + result);
            params.setRotation(result);
        }
        var layoutWidth = this._nativeView.getWidth();
        var layoutHeight = this._nativeView.getHeight();
        var mSupportedPictureSizes = params.getSupportedPictureSizes();
        var mPictureSize = CamHelpers.getOptimalPreviewSize(mSupportedPictureSizes, 1920, 1080);
        camera_plus_common_1.CLog("mPictureSize = " + mPictureSize);
        var mSupportedPreviewSizes = params.getSupportedPreviewSizes();
        var mPreviewSize = CamHelpers.getOptimalPreviewSize(mSupportedPreviewSizes, mPictureSize.width, mPictureSize.height);
        camera_plus_common_1.CLog("mPreviewSize = " + mPreviewSize);
        if (mPreviewSize) {
            if (this.isVideoEnabled()) {
                var width = 1920;
                var height = 1080;
                if (mSupportedPreviewSizes) {
                    var size = mSupportedPreviewSizes.get(0);
                    if (size) {
                        width = size.width;
                        height = size.height;
                    }
                }
                camera_plus_common_1.CLog("setPreviewSize: " + width + "x" + height);
                params.setPreviewSize(width, height);
            }
            else {
                params.setPreviewSize(mPreviewSize.width, mPreviewSize.height);
            }
        }
        params.setPictureSize(mPictureSize.width, mPictureSize.height);
        this.camera.setParameters(params);
        this.sendEvent(CameraPlus.parametersSetEvent, {
            previewSize: { width: params.getPreviewSize().width, height: params.getPreviewSize().height },
            pictureSize: { width: mPictureSize.width, height: mPictureSize.height },
            rotation: result
        });
        this.camera.setDisplayOrientation(result);
        if (this.isVideoEnabled() && this._mediaRecorder) {
            this._mediaRecorder.setOrientationHint(result);
        }
    };
    CameraPlus.prototype._releaseCameraAndPreview = function () {
        try {
            if (this._textureSurface !== null) {
                this._textureSurface.release();
                this._textureSurface = null;
            }
            if (this.camera) {
                this.camera.stopPreview();
                this.camera.release();
                this.camera = null;
            }
            if (this._mediaRecorder) {
                this._mediaRecorder.reset();
                this._mediaRecorder.release();
                this._mediaRecorder = null;
            }
        }
        catch (ex) {
            camera_plus_common_1.CLog('error _releaseCameraAndPreview', ex);
        }
    };
    CameraPlus.prototype._onPictureTaken = function (options, data) {
        var _this = this;
        this._releaseCameraAndPreview();
        this._initCamera(this.cameraId);
        if (this.hasStoragePermissions() === true) {
            this._finishSavingAndConfirmingPicture(options, data);
        }
        else {
            camera_plus_common_1.CLog("Application does not have permission to WRITE_EXTERNAL_STORAGE to save image.");
            var result = this.requestStoragePermissions()
                .then(function (result) {
                _this._finishSavingAndConfirmingPicture(options, data);
            })
                .catch(function (ex) {
                camera_plus_common_1.CLog('Error requesting storage permissions', ex);
            });
        }
    };
    CameraPlus.prototype._finishSavingAndConfirmingPicture = function (options, data) {
        return __awaiter(this, void 0, void 0, function () {
            var confirmPic, confirmPicRetakeText, confirmPicSaveText, saveToGallery, reqWidth, reqHeight, shouldKeepAspectRatio, shouldAutoSquareCrop, density, dateStamp, picturePath, nativeFile, orientation, bitmapMatrix, bitmapOptions, originalBmp, width, height, finalBmp, offsetWidth, offsetHeight, outputStream, fileName, folderPath, folderPath, result, asset, asset_1, asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldAutoSquareCrop = this.autoSquareCrop;
                        density = utils.layout.getDisplayDensity();
                        if (options) {
                            confirmPic = options.confirm ? true : false;
                            confirmPicRetakeText = options.confirmRetakeText ? options.confirmRetakeText : this.confirmRetakeText;
                            confirmPicSaveText = options.confirmSaveText ? options.confirmSaveText : this.confirmSaveText;
                            saveToGallery = options.saveToGallery ? true : false;
                            reqWidth = options.width ? options.width * density : 0;
                            reqHeight = options.height ? options.height * density : reqWidth;
                            shouldKeepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
                            shouldAutoSquareCrop = !!options.autoSquareCrop;
                        }
                        else {
                            camera_plus_common_1.CLog('Using property getters for defaults, no options.');
                            confirmPic = this.confirmPhotos;
                            saveToGallery = this.saveToGallery;
                        }
                        dateStamp = CamHelpers.createDateTimeStamp();
                        orientation = CamHelpers.getOrientationFromBytes(data);
                        bitmapMatrix = new android.graphics.Matrix();
                        switch (orientation) {
                            case 1:
                                break;
                            case 2:
                                bitmapMatrix.postScale(-1, 1);
                                break;
                            case 3:
                                bitmapMatrix.postRotate(180);
                                break;
                            case 4:
                                bitmapMatrix.postRotate(180);
                                bitmapMatrix.postScale(-1, 1);
                                break;
                            case 5:
                                bitmapMatrix.postRotate(90);
                                bitmapMatrix.postScale(-1, 1);
                                break;
                            case 6:
                                bitmapMatrix.postRotate(90);
                                break;
                            case 7:
                                bitmapMatrix.postRotate(270);
                                bitmapMatrix.postScale(-1, 1);
                                break;
                            case 8:
                                bitmapMatrix.postRotate(270);
                                break;
                        }
                        if (shouldAutoSquareCrop || orientation > 1) {
                            bitmapOptions = new android.graphics.BitmapFactory.Options();
                            bitmapOptions.inJustDecodeBounds = true;
                            originalBmp = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length, bitmapOptions);
                            camera_plus_common_1.CLog('originalBmp', originalBmp);
                            bitmapOptions.inSampleSize = CamHelpers.calculateInSampleSize(bitmapOptions, 1000, 1000);
                            camera_plus_common_1.CLog('bitmapOptions.inSampleSize', bitmapOptions.inSampleSize);
                            bitmapOptions.inJustDecodeBounds = false;
                            originalBmp = android.graphics.BitmapFactory.decodeByteArray(data, 0, data.length, bitmapOptions);
                            camera_plus_common_1.CLog('originalBmp', originalBmp);
                            width = originalBmp.getWidth();
                            height = originalBmp.getHeight();
                            finalBmp = void 0;
                            if (shouldAutoSquareCrop) {
                                offsetWidth = 0;
                                offsetHeight = 0;
                                if (width < height) {
                                    offsetHeight = (height - width) / 2;
                                    height = width;
                                }
                                else {
                                    offsetWidth = (width - height) / 2;
                                    width = height;
                                }
                                finalBmp = android.graphics.Bitmap.createBitmap(originalBmp, offsetWidth, offsetHeight, width, height, bitmapMatrix, false);
                                camera_plus_common_1.CLog('finalBmp', finalBmp);
                            }
                            else {
                                finalBmp = android.graphics.Bitmap.createBitmap(originalBmp, 0, 0, width, height, bitmapMatrix, false);
                                camera_plus_common_1.CLog('finalBmp', finalBmp);
                            }
                            camera_plus_common_1.CLog('recycling originalBmp...');
                            originalBmp.recycle();
                            outputStream = new java.io.ByteArrayOutputStream();
                            camera_plus_common_1.CLog('compressing finalBmp...');
                            finalBmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, outputStream);
                            camera_plus_common_1.CLog('recycling finalBmp...');
                            finalBmp.recycle();
                            data = outputStream.toByteArray();
                            camera_plus_common_1.CLog('byteArray data', data);
                            try {
                                camera_plus_common_1.CLog('closing outputStream...');
                                outputStream.close();
                            }
                            catch (ex) {
                                camera_plus_common_1.CLog('byteArrayOuputStream.close() error', ex);
                                this.sendEvent(CameraPlus.errorEvent, ex, 'Error closing ByteArrayOutputStream.');
                            }
                        }
                        fileName = "IMG_" + Date.now() + ".jpg";
                        if (saveToGallery === true) {
                            folderPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DCIM).toString() +
                                '/Camera/';
                            if (!fs.Folder.exists(folderPath)) {
                                fs.Folder.fromPath(folderPath);
                            }
                            picturePath = fs.path.join(folderPath, fileName);
                            nativeFile = new java.io.File(picturePath);
                        }
                        else {
                            folderPath = utils.ad
                                .getApplicationContext()
                                .getExternalFilesDir(null)
                                .getAbsolutePath();
                            if (!fs.Folder.exists(folderPath)) {
                                fs.Folder.fromPath(folderPath);
                            }
                            picturePath = fs.path.join(folderPath, fileName);
                            nativeFile = new java.io.File(picturePath);
                        }
                        camera_plus_common_1.CLog('picturePath', picturePath);
                        camera_plus_common_1.CLog('nativeFile', nativeFile);
                        if (!(saveToGallery === true && confirmPic === true)) return [3, 2];
                        this.sendEvent(CameraPlus.confirmScreenShownEvent);
                        return [4, CamHelpers.createImageConfirmationDialog(data, confirmPicRetakeText, confirmPicSaveText).catch(function (ex) {
                                camera_plus_common_1.CLog('Error createImageConfirmationDialog', ex);
                            })];
                    case 1:
                        result = _a.sent();
                        this.sendEvent(CameraPlus.confirmScreenDismissedEvent);
                        camera_plus_common_1.CLog("confirmation result = " + result);
                        if (result !== true) {
                            return [2];
                        }
                        this._savePicture(nativeFile, data);
                        asset = CamHelpers.assetFromPath(picturePath, reqWidth, reqHeight, shouldKeepAspectRatio);
                        this.sendEvent(CameraPlus.photoCapturedEvent, asset);
                        return [2];
                    case 2:
                        if (saveToGallery === true && !confirmPic) {
                            this._savePicture(nativeFile, data);
                            asset_1 = CamHelpers.assetFromPath(picturePath, reqWidth, reqHeight, shouldKeepAspectRatio);
                            this.sendEvent(CameraPlus.photoCapturedEvent, asset_1);
                            return [2];
                        }
                        asset = CamHelpers.assetFromPath(picturePath, reqWidth, reqHeight, shouldKeepAspectRatio);
                        this.sendEvent(CameraPlus.photoCapturedEvent, asset);
                        return [2];
                }
            });
        });
    };
    CameraPlus.prototype._savePicture = function (file, data) {
        try {
            this._saveImageToDisk(file, data);
            this._addPicToGallery(file);
        }
        catch (ex) {
            camera_plus_common_1.CLog('_savePicture error', ex);
        }
    };
    CameraPlus.prototype._saveImageToDisk = function (picFile, data) {
        var fos = null;
        try {
            fos = new java.io.FileOutputStream(picFile);
            camera_plus_common_1.CLog('fileOutputStream', fos);
            fos.write(data);
            camera_plus_common_1.CLog('closing fileOutputStream...');
            fos.close();
        }
        catch (ex) {
            camera_plus_common_1.CLog("error with fileOutputStream = " + ex);
            this.sendEvent(CameraPlus.errorEvent, ex, 'Error saving the image to disk.');
        }
    };
    CameraPlus.prototype._addPicToGallery = function (picFile) {
        try {
            var exifInterface = new android.media.ExifInterface(picFile.getPath());
            var tagOrientation = exifInterface.getAttribute('Orientation');
            camera_plus_common_1.CLog("tagOrientation = " + tagOrientation);
            var contentUri = android.net.Uri.fromFile(picFile);
            var mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
            app.android.context.sendBroadcast(mediaScanIntent);
        }
        catch (ex) {
            camera_plus_common_1.CLog('_addPicToGallery error', ex);
            this.sendEvent(CameraPlus.errorEvent, ex, 'Error adding image to device library.');
        }
    };
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Object)
    ], CameraPlus.prototype, "cameraId", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "autoFocus", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "flashOnIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "flashOffIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "toggleCameraIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "confirmPhotos", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "saveToGallery", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "takePicIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "galleryIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "insetButtons", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Number)
    ], CameraPlus.prototype, "insetButtonsPercent", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "enableVideo", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "isRecording", void 0);
    return CameraPlus;
}(camera_plus_common_1.CameraPlusBase));
exports.CameraPlus = CameraPlus;
//# sourceMappingURL=camera-plus.android.js.map