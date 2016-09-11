"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (OS) {
    OS[OS["LINUX"] = 0] = "LINUX";
    OS[OS["SOLARIS"] = 1] = "SOLARIS";
    OS[OS["BSD"] = 2] = "BSD";
    OS[OS["MACOS"] = 3] = "MACOS";
    OS[OS["WIN"] = 4] = "WIN";
    OS[OS["WIN64"] = 5] = "WIN64";
})(exports.OS || (exports.OS = {}));
var OS = exports.OS;
(function (ARCH) {
    ARCH[ARCH["X86"] = 0] = "X86";
    ARCH[ARCH["X86_64"] = 1] = "X86_64";
    ARCH[ARCH["ARM"] = 2] = "ARM";
})(exports.ARCH || (exports.ARCH = {}));
var ARCH = exports.ARCH;
var Platform = (function () {
    function Platform() {
    }
    return Platform;
}());
exports.Platform = Platform;
var PlatformLinuxX64 = (function (_super) {
    __extends(PlatformLinuxX64, _super);
    function PlatformLinuxX64() {
        _super.apply(this, arguments);
        this.os = OS.LINUX;
        this.arch = ARCH.X86_64;
        this.stackGrowsDown = true;
    }
    PlatformLinuxX64.prototype.assignTypeSizes = function (t) {
        for (var _i = 0, t_1 = t; _i < t_1.length; _i++) {
            var type = t_1[_i];
        }
    };
    return PlatformLinuxX64;
}(Platform));
exports.PlatformLinuxX64 = PlatformLinuxX64;
