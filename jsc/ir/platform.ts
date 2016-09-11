

export enum OS {
    LINUX,
    SOLARIS,
    BSD,
    MACOS,
    WIN,
    WIN64,
}

export enum ARCH {
    X86,
    X86_64,
    ARM,
}


export class Platform {
    os: OS;
    arch: ARCH;
}


export class PlatformLinuxX64 extends Platform {
    os = OS.LINUX;
    arch = ARCH.X86_64;

    stackGrowsDown = true;

    assignTypeSizes(t) {
        for(var type of t) {
            // if(type instanceof dom)
        }
    }
}

